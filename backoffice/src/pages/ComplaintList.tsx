import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listComplaints } from '../api/client';
import type { ComplaintDTO, ComplaintStatus } from '../api/types';
import { COMPLAINT_KIND_LABELS, COMPLAINT_STATUSES, COMPLAINT_TYPE_LABELS } from '../api/types';
import ComplaintStatusBadge from '../components/ComplaintStatusBadge';
import { formatDate } from './OrderList';

type Filter = ComplaintStatus | 'todos';

/** Rows per request; a full page means there may be more (cursor = last createdAt). */
export const PAGE_SIZE = 50;

const FILTER_LABELS: Record<Filter, string> = { todos: 'Todas', nuevo: 'Nuevas', atendido: 'Atendidas' };

export default function ComplaintList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('todos');
  const [complaints, setComplaints] = useState<ComplaintDTO[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setComplaints(null);
    setHasMore(false);
    setError(null);
    listComplaints({ status: filter === 'todos' ? undefined : filter, limit: PAGE_SIZE })
      .then((list) => {
        if (!alive) return;
        setComplaints(list);
        setHasMore(list.length === PAGE_SIZE);
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : 'Error al cargar reclamaciones');
      });
    return () => {
      alive = false;
    };
  }, [filter]);

  const loadMore = async () => {
    if (!complaints || complaints.length === 0) return;
    const last = complaints[complaints.length - 1];
    setLoadingMore(true);
    setError(null);
    try {
      const next = await listComplaints({
        status: filter === 'todos' ? undefined : filter,
        limit: PAGE_SIZE,
        cursor: last.createdAt,
      });
      setComplaints([...complaints, ...next]);
      setHasMore(next.length === PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar más reclamaciones');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>Reclamaciones</h1>
      </div>
      <div className="filter-tabs" role="tablist" aria-label="Filtrar por estado">
        {(['todos', ...COMPLAINT_STATUSES] as Filter[]).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            className={`filter-tab${filter === value ? ' active' : ''}`}
            onClick={() => setFilter(value)}
          >
            {FILTER_LABELS[value]}
          </button>
        ))}
      </div>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {complaints === null ? (
        !error && <p className="muted">Cargando…</p>
      ) : complaints.length === 0 ? (
        <p className="muted">Sin reclamaciones{filter !== 'todos' ? ' con este estado' : ''}.</p>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Consumidor</th>
                  <th>Bien</th>
                  <th>Pedido</th>
                  <th>Email enviado</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr
                    key={complaint.id}
                    className="row-link"
                    onClick={() => navigate(`/complaints/${complaint.id}`)}
                  >
                    <td className="mono">{complaint.code}</td>
                    <td>{formatDate(complaint.createdAt)}</td>
                    <td>{COMPLAINT_TYPE_LABELS[complaint.claim.type]}</td>
                    <td>
                      {complaint.consumer.name}
                      <div className="muted">{complaint.consumer.email}</div>
                    </td>
                    <td>
                      {complaint.item.description}
                      <div className="muted">{COMPLAINT_KIND_LABELS[complaint.item.kind]}</div>
                    </td>
                    <td className="mono">{complaint.orderId ?? '—'}</td>
                    <td>{complaint.emailSent ? 'Sí' : 'No'}</td>
                    <td>
                      <ComplaintStatusBadge status={complaint.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div className="load-more">
              <button type="button" className="btn btn-ghost" disabled={loadingMore} onClick={() => void loadMore()}>
                {loadingMore ? 'Cargando…' : 'Cargar más'}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
