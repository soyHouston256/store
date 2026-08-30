import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderDetail from './OrderDetail';
import type { OrderStatus } from '../api/types';
import { errorEnvelope, jsonResponse, makeOrder } from '../test/utils';

const fetchMock = vi.fn();

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/orders/ab12cd34']}>
      <Routes>
        <Route path="/orders/:id" element={<OrderDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

function mockGet(status: OrderStatus) {
  fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(200, makeOrder({ status }))));
}

describe('OrderDetail', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('renders customer, items with chips, total and WhatsApp link', async () => {
    mockGet('pendiente');
    renderDetail();

    expect(await screen.findByText('María')).toBeInTheDocument();
    expect(screen.getByText('12345678')).toBeInTheDocument();
    expect(screen.getByText('987654321')).toBeInTheDocument();
    expect(screen.getByText('Polo azul')).toBeInTheDocument();
    expect(screen.getByText('Talla M')).toBeInTheDocument();
    expect(screen.getByText('Pecho')).toBeInTheDocument();
    expect(screen.getByText('Total: S/ 115')).toBeInTheDocument();

    const wa = screen.getByRole('link', { name: 'Avisar por WhatsApp' });
    expect(wa).toHaveAttribute('target', '_blank');
    expect(wa.getAttribute('href')).toContain('https://wa.me/51987654321?text=');
  });

  it('pendiente shows Confirmar and Cancelar pedido only', async () => {
    mockGet('pendiente');
    renderDetail();

    expect(await screen.findByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar pedido' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /volver a (pendiente|confirmado|pagado|preparado|enviado)/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /marcar/i })).toBeNull();
  });

  it('enviado shows Marcar recibido and Volver a preparado, without cancel', async () => {
    mockGet('enviado');
    renderDetail();

    expect(await screen.findByRole('button', { name: 'Marcar recibido' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver a preparado' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancelar pedido' })).toBeNull();
  });

  it('recibido shows Finalizar pedido only, guarded by a confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    fetchMock.mockImplementation((_input: unknown, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        return Promise.resolve(jsonResponse(200, makeOrder({ status: 'finalizado' })));
      }
      return Promise.resolve(jsonResponse(200, makeOrder({ status: 'recibido' })));
    });
    const user = userEvent.setup();
    renderDetail();

    const finalize = await screen.findByRole('button', { name: 'Finalizar pedido' });
    expect(screen.queryByRole('button', { name: /marcar|volver a|cancelar pedido/i })).toBeNull();

    // declining the confirmation does not PATCH
    await user.click(finalize);
    expect(confirmSpy).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls.some(([, init]) => (init as RequestInit)?.method === 'PATCH')).toBe(
      false,
    );

    // accepting it finalizes the order
    confirmSpy.mockReturnValue(true);
    await user.click(finalize);
    expect(
      await screen.findByText('Estado final — no hay acciones disponibles.'),
    ).toBeInTheDocument();
    const patch = fetchMock.mock.calls.find(([, init]) => (init as RequestInit)?.method === 'PATCH');
    expect((patch?.[1] as RequestInit).body).toBe(JSON.stringify({ status: 'finalizado' }));
    confirmSpy.mockRestore();
  });

  it('finalizado is final: no action buttons', async () => {
    mockGet('finalizado');
    renderDetail();

    expect(await screen.findByText('Estado final — no hay acciones disponibles.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirmar|marcar|finalizar|volver a (pendiente|confirmado|pagado|preparado|enviado|recibido)|cancelar pedido/i })).toBeNull();
  });

  it('cancelado is final: banner shown and no action buttons', async () => {
    mockGet('cancelado');
    renderDetail();

    expect(await screen.findByText('Este pedido fue cancelado.')).toBeInTheDocument();
    expect(screen.getByText('Estado final — no hay acciones disponibles.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirmar|marcar|cancelar pedido/i })).toBeNull();
  });

  it('updates the order from the PATCH response', async () => {
    fetchMock.mockImplementation((_input: unknown, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        return Promise.resolve(jsonResponse(200, makeOrder({ status: 'confirmado' })));
      }
      return Promise.resolve(jsonResponse(200, makeOrder({ status: 'pendiente' })));
    });
    const user = userEvent.setup();
    renderDetail();

    await user.click(await screen.findByRole('button', { name: 'Confirmar' }));

    expect(await screen.findByRole('button', { name: 'Marcar pagado' })).toBeInTheDocument();
    const patch = fetchMock.mock.calls.find(([, init]) => (init as RequestInit)?.method === 'PATCH');
    expect(String(patch?.[0])).toContain('/api/admin/orders/ab12cd34/status');
    expect((patch?.[1] as RequestInit).body).toBe(JSON.stringify({ status: 'confirmado' }));
  });

  it('surfaces a 400 invalid-transition error with a reload option', async () => {
    fetchMock.mockImplementation((_input: unknown, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        return Promise.resolve(
          jsonResponse(
            400,
            errorEnvelope('VALIDATION', 'Transición inválida. Permitidos: pagado, pendiente, cancelado'),
          ),
        );
      }
      return Promise.resolve(jsonResponse(200, makeOrder({ status: 'pendiente' })));
    });
    const user = userEvent.setup();
    renderDetail();

    await user.click(await screen.findByRole('button', { name: 'Confirmar' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Transición inválida. Permitidos: pagado, pendiente, cancelado');
    expect(alert).toHaveTextContent('otro administrador');
    expect(screen.getByRole('button', { name: 'Recargar pedido' })).toBeInTheDocument();
  });
});
