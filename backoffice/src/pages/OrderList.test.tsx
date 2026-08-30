import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderList from './OrderList';
import { jsonResponse, makeOrder } from '../test/utils';

const fetchMock = vi.fn();

function renderList() {
  return render(
    <MemoryRouter initialEntries={['/orders']}>
      <Routes>
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/:id" element={<div>detail page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('OrderList', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('renders orders with customer, item count, total and status badge', async () => {
    const orders = [
      makeOrder(),
      makeOrder({
        id: 'ef56gh78',
        status: 'enviado',
        total: 25,
        items: [{ productId: 'p2', name: 'Taza logo', type: 'taza', price: 25, quantity: 1 }],
        user: { dni: '87654321', name: 'Carlos', phone: '912345678' },
      }),
    ];
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(200, orders)));
    renderList();

    expect(await screen.findByText('ab12cd34')).toBeInTheDocument();
    expect(screen.getByText('María')).toBeInTheDocument();
    expect(screen.getByText('987654321')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // 2 polos + 1 taza
    expect(screen.getByText('S/ 115')).toBeInTheDocument();
    expect(screen.getByText('Enviado', { selector: '.status-badge' })).toBeInTheDocument();
    // first request has no status filter
    expect(String(fetchMock.mock.calls[0][0])).toContain('/api/admin/orders');
    expect(String(fetchMock.mock.calls[0][0])).not.toContain('?status=');
  });

  it('filters by status via the tabs', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(200, [])));
    const user = userEvent.setup();
    renderList();

    await screen.findByText('No hay pedidos todavía.');
    await user.click(screen.getByRole('tab', { name: 'Pendiente' }));

    expect(await screen.findByText('No hay pedidos con este estado.')).toBeInTheDocument();
    expect(String(fetchMock.mock.lastCall?.[0])).toContain('/api/admin/orders?status=pendiente');
  });

  it('navigates to the detail on row click', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(200, [makeOrder()])));
    const user = userEvent.setup();
    renderList();

    await user.click(await screen.findByText('ab12cd34'));
    expect(await screen.findByText('detail page')).toBeInTheDocument();
  });
});
