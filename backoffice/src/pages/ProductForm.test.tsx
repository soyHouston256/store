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

function renderEditForm(id = 'polo-1') {
  return render(
    <MemoryRouter initialEntries={[`/products/${id}`]}>
      <Routes>
        <Route path="/products/:id" element={<ProductForm />} />
      </Routes>
    </MemoryRouter>,
  );
}

const poloDto = {
  id: 'polo-1',
  name: 'Polo Python',
  price: 60,
  type: 'polo',
  colors: [],
  sizes: ['S', 'M'],
  logoPositions: ['pocket', 'chest', 'back'],
  likes: 0,
  published: false,
  slug: 'polo-python',
  cuts: ['hombre', 'mujer'],
  soldOut: false,
  createdAt: '2026-09-01T00:00:00.000Z',
};

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

  // ---- phase 4 (R4.5) ----

  it('prefills the slug from the name while creating and sends it with cuts/soldOut defaults', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, poloDto));
    const user = userEvent.setup();
    renderNewForm();

    await user.type(screen.getByLabelText('Nombre'), 'Polo Node.js');
    expect(screen.getByLabelText('Slug')).toHaveValue('polo-node-js');
    await user.type(screen.getByLabelText('Precio'), '60');
    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body as string)).toMatchObject({
      slug: 'polo-node-js',
      cuts: ['hombre'],
      soldOut: false,
    });
  });

  it('a hand-edited slug stops following the name; "Generar desde nombre" regenerates it', async () => {
    const user = userEvent.setup();
    renderNewForm();

    await user.type(screen.getByLabelText('Nombre'), 'Polo Go');
    await user.clear(screen.getByLabelText('Slug'));
    await user.type(screen.getByLabelText('Slug'), 'golang');
    await user.type(screen.getByLabelText('Nombre'), ' Pro');
    expect(screen.getByLabelText('Slug')).toHaveValue('golang');

    await user.click(screen.getByRole('button', { name: 'Generar desde nombre' }));
    expect(screen.getByLabelText('Slug')).toHaveValue('polo-go-pro');
  });

  it('rejects a malformed slug on the client', async () => {
    const user = userEvent.setup();
    renderNewForm();

    await user.type(screen.getByLabelText('Nombre'), 'Polo');
    await user.type(screen.getByLabelText('Precio'), '60');
    await user.clear(screen.getByLabelText('Slug'));
    await user.type(screen.getByLabelText('Slug'), 'Polo React');
    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(screen.getByText('Solo minúsculas, números y guiones simples (máx. 80)')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows a 409 CONFLICT inline under the slug field', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(409, errorEnvelope('CONFLICT', 'Slug already in use', [{ field: 'slug', message: 'Slug already in use' }])),
    );
    const user = userEvent.setup();
    renderNewForm();

    await user.type(screen.getByLabelText('Nombre'), 'Polo React');
    await user.type(screen.getByLabelText('Precio'), '60');
    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    const slugField = screen.getByLabelText('Slug');
    const error = await screen.findByText('Slug already in use');
    expect(slugField.closest('.field')).toContainElement(error);
    expect(screen.getByRole('alert')).toHaveTextContent('Revisa los campos marcados');
  });

  it('blocks saving a polo when both cuts are unchecked', async () => {
    const user = userEvent.setup();
    renderNewForm();

    await user.type(screen.getByLabelText('Nombre'), 'Polo sin corte');
    await user.type(screen.getByLabelText('Precio'), '60');
    // 'hombre' is checked by default; 'mujer' is not.
    expect(screen.getByRole('checkbox', { name: /Corte hombre/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Corte mujer/ })).not.toBeChecked();
    await user.click(screen.getByRole('checkbox', { name: /Corte hombre/ }));
    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(screen.getByText('Selecciona al menos un corte')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends the selected cuts and the sold-out flag', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, poloDto));
    const user = userEvent.setup();
    renderNewForm();

    await user.type(screen.getByLabelText('Nombre'), 'Polo Ambos');
    await user.type(screen.getByLabelText('Precio'), '60');
    await user.click(screen.getByRole('checkbox', { name: /Corte mujer/ }));
    await user.click(screen.getByRole('checkbox', { name: /Agotado/ }));
    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body as string)).toMatchObject({ cuts: ['hombre', 'mujer'], soldOut: true });
  });

  it('hides the sizes input for polos (table per cut) and shows it for other types without cuts', async () => {
    const user = userEvent.setup();
    renderNewForm();

    expect(screen.queryByLabelText('Tallas')).toBeNull();
    expect(screen.getByText(/Las tallas de polos vienen de la tabla por corte/)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Tipo'), 'taza');
    expect(screen.getByLabelText('Tallas')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /Corte hombre/ })).toBeNull();

    fetchMock.mockResolvedValue(jsonResponse(201, { ...poloDto, type: 'taza', cuts: [] }));
    await user.type(screen.getByLabelText('Nombre'), 'Taza');
    await user.type(screen.getByLabelText('Precio'), '35');
    await user.click(screen.getByRole('button', { name: 'Crear producto' }));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body).not.toHaveProperty('cuts');
    expect(body.slug).toBe('taza');
  });
});

describe('ProductForm (edit) — phase 4', () => {
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

  it('loads slug/cuts/soldOut, does not rewrite the slug when the name changes, and sends the stored sizes for a polo', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, poloDto));
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ...poloDto, name: 'Polo Python 3', soldOut: true }));
    const user = userEvent.setup();
    renderEditForm();

    expect(await screen.findByLabelText('Slug')).toHaveValue('polo-python');
    expect(screen.getByRole('checkbox', { name: /Corte hombre/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Corte mujer/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Agotado/ })).not.toBeChecked();
    expect(screen.queryByLabelText('Tallas')).toBeNull();

    await user.type(screen.getByLabelText('Nombre'), ' 3');
    expect(screen.getByLabelText('Slug')).toHaveValue('polo-python');
    await user.click(screen.getByRole('checkbox', { name: /Agotado/ }));
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Guardado.')).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toContain('/api/admin/products/polo-1');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body as string)).toMatchObject({
      name: 'Polo Python 3',
      slug: 'polo-python',
      cuts: ['hombre', 'mujer'],
      soldOut: true,
      sizes: ['S', 'M'],
    });
  });

  it('shows a 409 on rename under the slug field and keeps the form editable', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, poloDto));
    fetchMock.mockResolvedValueOnce(
      jsonResponse(409, errorEnvelope('CONFLICT', 'Slug already in use', [{ field: 'slug', message: 'Slug already in use' }])),
    );
    const user = userEvent.setup();
    renderEditForm();

    const slugInput = await screen.findByLabelText('Slug');
    await user.clear(slugInput);
    await user.type(slugInput, 'polo-react');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Slug already in use')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled();
  });
});
