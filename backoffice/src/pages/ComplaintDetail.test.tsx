import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ComplaintDetail from './ComplaintDetail';
import { errorEnvelope, jsonResponse, makeComplaint } from '../test/utils';

const fetchMock = vi.fn();

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/complaints/64b64b64b64b64b64b64b001']}>
      <Routes>
        <Route path="/complaints/:id" element={<ComplaintDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ComplaintDetail', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('renders code, consumer, item, detail, request and order link', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(200, makeComplaint())));
    renderDetail();

    expect(await screen.findByText('LR-2026-000001')).toBeInTheDocument();
    expect(screen.getByText('Nuevo', { selector: '.status-badge' })).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('12345678')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByText('Av. Siempre Viva 742, Lima')).toBeInTheDocument();
    expect(screen.getByText('Polo Docker talla M')).toBeInTheDocument();
    expect(screen.getByText('S/ 80')).toBeInTheDocument();
    expect(screen.getByText(/estampado descentrado/)).toBeInTheDocument();
    expect(screen.getByText('Cambio por uno nuevo sin defectos.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'A1B2C3D4' })).toHaveAttribute('href', '/orders/A1B2C3D4');
    expect(screen.getByText('No')).toBeInTheDocument(); // email enviado
    expect(String(fetchMock.mock.calls[0][0])).toContain('/api/admin/complaints/64b64b64b64b64b64b64b001');
  });

  it('shows the guardian for a minor and omits the order link when there is none', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        jsonResponse(
          200,
          makeComplaint({
            consumer: { ...makeComplaint().consumer, isMinor: true },
            guardianName: 'Annabella Byron',
            orderId: undefined,
          }),
        ),
      ),
    );
    renderDetail();
    expect(await screen.findByText(/Annabella Byron/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'A1B2C3D4' })).toBeNull();
  });

  it('"Marcar atendido" PATCHes the status and updates the badge, then offers "Marcar como nuevo"', async () => {
    fetchMock
      .mockImplementationOnce(() => Promise.resolve(jsonResponse(200, makeComplaint())))
      .mockImplementationOnce(() => Promise.resolve(jsonResponse(200, makeComplaint({ status: 'atendido' }))));
    const user = userEvent.setup();
    renderDetail();

    await user.click(await screen.findByRole('button', { name: 'Marcar atendido' }));

    expect(await screen.findByText('Atendido', { selector: '.status-badge' })).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(url).toContain('/api/admin/complaints/64b64b64b64b64b64b64b001/status');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(String(init.body))).toEqual({ status: 'atendido' });
    expect(screen.getByRole('button', { name: 'Marcar como nuevo' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Marcar atendido' })).toBeNull();
  });

  it('shows "Reclamación no encontrada." on 404', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse(404, errorEnvelope('NOT_FOUND', 'Complaint not found'))),
    );
    renderDetail();
    expect(await screen.findByRole('alert')).toHaveTextContent('Reclamación no encontrada.');
  });
});
