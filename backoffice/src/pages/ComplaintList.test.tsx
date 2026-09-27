import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ComplaintList, { PAGE_SIZE } from './ComplaintList';
import { jsonResponse, makeComplaint } from '../test/utils';

const fetchMock = vi.fn();

function renderList() {
  return render(
    <MemoryRouter initialEntries={['/complaints']}>
      <Routes>
        <Route path="/complaints" element={<ComplaintList />} />
        <Route path="/complaints/:id" element={<div>detail page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ComplaintList', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('renders two complaints newest first with code, type, consumer, item, order, email and status', async () => {
    // API already sorts createdAt desc; the table keeps that order.
    const complaints = [
      makeComplaint({
        id: 'c2',
        code: 'LR-2026-000002',
        createdAt: '2026-03-16T09:00:00.000Z',
        claim: { type: 'queja', detail: 'Nadie respondió mis mensajes durante una semana.', request: 'Una disculpa.' },
        consumer: { ...makeComplaint().consumer, name: 'Grace Hopper', email: 'grace@example.com' },
        item: { kind: 'servicio', description: 'Atención por WhatsApp' },
        orderId: undefined,
        emailSent: true,
        status: 'atendido',
      }),
      makeComplaint({ id: 'c1' }),
    ];
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(200, complaints)));
    renderList();

    const rows = await screen.findAllByRole('row');
    const bodyRows = rows.slice(1); // skip header
    expect(bodyRows).toHaveLength(2);
    expect(within(bodyRows[0]).getByText('LR-2026-000002')).toBeInTheDocument();
    expect(within(bodyRows[0]).getByText('Queja')).toBeInTheDocument();
    expect(within(bodyRows[0]).getByText('Grace Hopper')).toBeInTheDocument();
    expect(within(bodyRows[0]).getByText('Atención por WhatsApp')).toBeInTheDocument();
    expect(within(bodyRows[0]).getByText('—')).toBeInTheDocument();
    expect(within(bodyRows[0]).getByText('Sí')).toBeInTheDocument();
    expect(within(bodyRows[0]).getByText('Atendido', { selector: '.status-badge' })).toBeInTheDocument();

    expect(within(bodyRows[1]).getByText('LR-2026-000001')).toBeInTheDocument();
    expect(within(bodyRows[1]).getByText('Reclamo')).toBeInTheDocument();
    expect(within(bodyRows[1]).getByText('Ada Lovelace')).toBeInTheDocument();
    expect(within(bodyRows[1]).getByText('Polo Docker talla M')).toBeInTheDocument();
    expect(within(bodyRows[1]).getByText('A1B2C3D4')).toBeInTheDocument();
    expect(within(bodyRows[1]).getByText('No')).toBeInTheDocument();
    expect(within(bodyRows[1]).getByText('Nuevo', { selector: '.status-badge' })).toBeInTheDocument();

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain(`/api/admin/complaints?limit=${PAGE_SIZE}`);
    expect(url).not.toContain('status=');
    expect(screen.queryByRole('button', { name: 'Cargar más' })).toBeNull();
  });

  it('shows "Sin reclamaciones" when the list is empty', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(200, [])));
    renderList();
    expect(await screen.findByText('Sin reclamaciones.')).toBeInTheDocument();
  });

  it('filters by status via the tabs', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(200, [])));
    const user = userEvent.setup();
    renderList();

    await screen.findByText('Sin reclamaciones.');
    await user.click(screen.getByRole('tab', { name: 'Atendidas' }));

    expect(await screen.findByText('Sin reclamaciones con este estado.')).toBeInTheDocument();
    expect(String(fetchMock.mock.lastCall?.[0])).toContain('status=atendido');
  });

  it('navigates to the detail on row click', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(200, [makeComplaint()])));
    const user = userEvent.setup();
    renderList();

    await user.click(await screen.findByText('LR-2026-000001'));
    expect(await screen.findByText('detail page')).toBeInTheDocument();
  });

  it('offers "Cargar más" after a full page and requests older rows with cursor=last createdAt', async () => {
    const fullPage = Array.from({ length: PAGE_SIZE }, (_, i) =>
      makeComplaint({
        id: `p${i}`,
        code: `LR-2026-${String(PAGE_SIZE - i).padStart(6, '0')}`,
        createdAt: new Date(Date.UTC(2026, 0, PAGE_SIZE - i)).toISOString(),
      }),
    );
    const older = [makeComplaint({ id: 'old', code: 'LR-2025-000009', createdAt: '2025-12-31T10:00:00.000Z' })];
    fetchMock
      .mockImplementationOnce(() => Promise.resolve(jsonResponse(200, fullPage)))
      .mockImplementationOnce(() => Promise.resolve(jsonResponse(200, older)));
    const user = userEvent.setup();
    renderList();

    const more = await screen.findByRole('button', { name: 'Cargar más' });
    await user.click(more);

    expect(await screen.findByText('LR-2025-000009')).toBeInTheDocument();
    const lastCreatedAt = fullPage[fullPage.length - 1].createdAt;
    expect(String(fetchMock.mock.lastCall?.[0])).toContain(`cursor=${encodeURIComponent(lastCreatedAt)}`);
    expect(screen.queryByRole('button', { name: 'Cargar más' })).toBeNull();
    expect(screen.getAllByRole('row')).toHaveLength(PAGE_SIZE + 2);
  });

  it('shows the API error', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse(500, { error: { code: 'INTERNAL', message: 'Internal server error' } })),
    );
    renderList();
    expect(await screen.findByRole('alert')).toHaveTextContent('Internal server error');
  });
});
