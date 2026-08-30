import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductForm from './ProductForm';
import { errorEnvelope, jsonResponse, makeToken } from '../test/utils';

const fetchMock = vi.fn();

function renderNewForm() {
  return render(
    <MemoryRouter initialEntries={['/products/new']}>
      <Routes>
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id" element={<p>Producto guardado</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProductForm (new)', () => {
  beforeEach(() => {
    localStorage.setItem('bo_token', makeToken(3600));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('shows client validation messages for missing name and non-positive price', async () => {
    const user = userEvent.setup();
    renderNewForm();

    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('El precio debe ser mayor que 0')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects price 0', async () => {
    const user = userEvent.setup();
    renderNewForm();

    await user.type(screen.getByLabelText('Nombre'), 'Taza roja');
    await user.type(screen.getByLabelText('Precio'), '0');
    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(screen.getByText('El precio debe ser mayor que 0')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('renders server 400 details inline by field', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        400,
        errorEnvelope('VALIDATION', 'Invalid request', [
          { field: 'colors.0', message: 'Color hex inválido' },
          { field: 'name', message: 'Nombre demasiado largo' },
        ]),
      ),
    );
    const user = userEvent.setup();
    renderNewForm();

    await user.type(screen.getByLabelText('Nombre'), 'Taza roja');
    await user.type(screen.getByLabelText('Precio'), '25');
    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(await screen.findByText('Color hex inválido')).toBeInTheDocument();
    expect(screen.getByText('Nombre demasiado largo')).toBeInTheDocument();
  });

  it('validates hex colors in the TagInput before adding', async () => {
    const user = userEvent.setup();
    renderNewForm();

    await user.type(screen.getByLabelText('Colores (hex)'), 'rojo');
    await user.keyboard('{Enter}');
    expect(screen.getByText('Debe ser un color hex, ej. #ff0000')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Colores (hex)'));
    await user.type(screen.getByLabelText('Colores (hex)'), '#ff0000');
    await user.keyboard('{Enter}');
    expect(screen.getByText('#ff0000')).toBeInTheDocument();
  });

  it('sends the selected polo logo positions when creating a product', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(201, {
        id: 'polo-1',
        name: 'Polo Python',
        price: 60,
        type: 'polo',
        colors: [],
        sizes: [],
        logoPositions: ['pocket', 'chest', 'back'],
        likes: 0,
        published: false,
      }),
    );
    const user = userEvent.setup();
    renderNewForm();

    await user.type(screen.getByLabelText('Nombre'), 'Polo Python');
    await user.type(screen.getByLabelText('Precio'), '60');
    await user.click(screen.getByRole('checkbox', { name: /Bolsillo \+ espalda/ }));
    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body as string)).toMatchObject({
      name: 'Polo Python',
      price: 60,
      type: 'polo',
      logoPositions: ['pocket', 'chest', 'back'],
    });
  });

  it('requires at least one logo position for polos', async () => {
    const user = userEvent.setup();
    renderNewForm();

    await user.type(screen.getByLabelText('Nombre'), 'Polo sin ubicación');
    await user.type(screen.getByLabelText('Precio'), '60');
    await user.click(screen.getByRole('checkbox', { name: /Bolsillo delantero/ }));
    await user.click(screen.getByRole('checkbox', { name: /Pecho/ }));
    await user.click(screen.getByRole('checkbox', { name: /Espalda/ }));
    await user.click(screen.getByRole('checkbox', { name: /Bolsillo \+ espalda/ }));
    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(screen.getByText('Selecciona al menos una ubicación del logo')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
