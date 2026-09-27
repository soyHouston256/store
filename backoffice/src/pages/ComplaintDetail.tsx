import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, getComplaint, setComplaintStatus } from '../api/client';
import type { ComplaintDTO, ComplaintStatus } from '../api/types';
import { COMPLAINT_DOC_TYPE_LABELS, COMPLAINT_KIND_LABELS, COMPLAINT_TYPE_LABELS } from '../api/types';
import ComplaintStatusBadge from '../components/ComplaintStatusBadge';
import { formatDate } from './OrderList';

export default function ComplaintDetail() {
  const { id = '' } = useParams();
  const [complaint, setComplaint] = useState<ComplaintDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    setComplaint(null);
    setError(null);
    setActionError(null);
    getComplaint(id)
      .then((data) => {
        if (alive) setComplaint(data);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        if (err instanceof ApiError && err.status === 404) {
          setError('Reclamación no encontrada.');
        } else {
          setError(err instanceof Error ? err.message : 'Error al cargar la reclamación');
        }
      });
    return () => {
      alive = false;
    };
  }, [id]);

  const changeStatus = async (status: ComplaintStatus) => {
    if (!complaint) return;
    setActionError(null);
    setBusy(true);
    try {
      setComplaint(await setComplaintStatus(complaint.id, status));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al cambiar el estado');
    } finally {
      setBusy(false);
    }
  };

  if (error && !complaint) {
    return (
      <>
        <div className="page-head">
          <h1>Reclamación</h1>
          <Link className="btn btn-ghost" to="/complaints">
            Volver a reclamaciones
          </Link>
        </div>
        <div className="form-error" role="alert">
          {error}
        </div>
      </>
    );
  }

  if (!complaint) return <p className="muted">Cargando…</p>;

  const { consumer, item, claim } = complaint;

  return (
    <>
      <div className="page-head">
        <h1>
          Reclamación <span className="mono">{complaint.code}</span>{' '}
          <ComplaintStatusBadge status={complaint.status} />
        </h1>
        <Link className="btn btn-ghost" to="/complaints">
          Volver a reclamaciones
        </Link>
      </div>

      <div className="panel order-section">
        <h2>{COMPLAINT_TYPE_LABELS[claim.type]}</h2>
        <dl className="customer-grid">
          <div>
            <dt>Fecha</dt>
            <dd>{formatDate(complaint.createdAt)}</dd>
          </div>
          <div>
            <dt>Email enviado</dt>
            <dd>{complaint.emailSent ? 'Sí' : 'No'}</dd>
          </div>
          <div>
            <dt>Pedido</dt>
            <dd>
              {complaint.orderId ? (
                <Link className="mono" to={`/orders/${complaint.orderId}`}>
                  {complaint.orderId}
                </Link>
              ) : (
                '—'
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="panel order-section">
        <h2>Consumidor</h2>
        <dl className="customer-grid">
          <div>
            <dt>Nombre</dt>
            <dd>{consumer.name}</dd>
          </div>
          <div>
            <dt>Documento</dt>
            <dd>
              {COMPLAINT_DOC_TYPE_LABELS[consumer.docType]} <span className="mono">{consumer.docNumber}</span>
            </dd>
          </div>
          <div>
            <dt>Correo</dt>
            <dd>{consumer.email}</dd>
          </div>
          <div>
            <dt>Teléfono</dt>
            <dd>{consumer.phone}</dd>
          </div>
          <div>
            <dt>Domicilio</dt>
            <dd>{consumer.address}</dd>
          </div>
          {consumer.isMinor && (
            <div>
              <dt>Apoderado</dt>
              <dd>{complaint.guardianName ?? '—'} (menor de edad)</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="panel order-section">
        <h2>Bien contratado</h2>
        <dl className="customer-grid">
          <div>
            <dt>Tipo</dt>
            <dd>{COMPLAINT_KIND_LABELS[item.kind]}</dd>
          </div>
          <div>
            <dt>Descripción</dt>
            <dd>{item.description}</dd>
          </div>
          <div>
            <dt>Monto reclamado</dt>
            <dd>{item.amount != null ? `S/ ${item.amount}` : '—'}</dd>
          </div>
        </dl>
      </div>

      <div className="panel order-section">
        <h2>Detalle</h2>
        <p className="prewrap">{claim.detail}</p>
      </div>

      <div className="panel order-section">
        <h2>Pedido del consumidor</h2>
        <p className="prewrap">{claim.request}</p>
      </div>

      <div className="panel order-section">
        <h2>Estado</h2>
        {actionError && (
          <div className="form-error" role="alert">
            {actionError}
          </div>
        )}
        <div className="form-actions">
          {complaint.status === 'nuevo' ? (
            <button type="button" className="btn" disabled={busy} onClick={() => void changeStatus('atendido')}>
              Marcar atendido
            </button>
          ) : (
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void changeStatus('nuevo')}>
              Marcar como nuevo
            </button>
          )}
        </div>
      </div>
    </>
  );
}
