import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, getOrder, updateOrderStatus } from '../api/client';
import type { OrderDTO, OrderStatus } from '../api/types';
import { LOGO_POSITION_OPTIONS } from '../api/types';
import {
  FORWARD_ACTION_LABELS,
  ORDER_FLOW,
  STATUS_LABELS,
  canCancel,
  nextForward,
  previousBackward,
} from '../api/statusFlow';
import { whatsappUrl } from '../api/whatsapp';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from './OrderList';

function logoPositionLabel(value: string): string {
  return LOGO_POSITION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export default function OrderDetail() {
  const { id = '' } = useParams();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError(null);
    setActionError(null);
    getOrder(id)
      .then(setOrder)
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setError('Pedido no encontrado.');
        } else {
          setError(err instanceof Error ? err.message : 'Error al cargar el pedido');
        }
      });
  }, [id]);

  useEffect(() => {
    let alive = true;
    setOrder(null);
    setError(null);
    setActionError(null);
    getOrder(id)
      .then((data) => {
        if (alive) setOrder(data);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        if (err instanceof ApiError && err.status === 404) {
          setError('Pedido no encontrado.');
        } else {
          setError(err instanceof Error ? err.message : 'Error al cargar el pedido');
        }
      });
    return () => {
      alive = false;
    };
  }, [id]);

  const changeStatus = async (status: OrderStatus) => {
    if (!order) return;
    setActionError(null);
    setBusy(true);
    try {
      const updated = await updateOrderStatus(order.id, status);
      setOrder(updated);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setActionError(
          `${err.message} — puede que otro administrador haya cambiado el pedido.`,
        );
      } else {
        setActionError(err instanceof Error ? err.message : 'Error al cambiar el estado');
      }
    } finally {
      setBusy(false);
    }
  };

  const onCancel = () => {
    if (!order) return;
    if (!window.confirm(`¿Cancelar el pedido ${order.id}? Esta acción detiene el flujo.`)) return;
    void changeStatus('cancelado');
  };

  const onForward = (target: OrderStatus) => {
    if (!order) return;
    if (
      target === 'finalizado' &&
      !window.confirm(
        `¿Finalizar el pedido ${order.id}? Esta acción es irreversible y el cliente dejará de ver el detalle del pedido.`,
      )
    ) {
      return;
    }
    void changeStatus(target);
  };

  if (error && !order) {
    return (
      <>
        <div className="page-head">
          <h1>Pedido</h1>
          <Link className="btn btn-ghost" to="/orders">
            Volver a pedidos
          </Link>
        </div>
        <div className="form-error" role="alert">
          {error}
        </div>
      </>
    );
  }

  if (!order) return <p className="muted">Cargando…</p>;

  const forward = nextForward(order.status);
  const backward = previousBackward(order.status);
  const cancellable = canCancel(order.status);
  const cancelled = order.status === 'cancelado';

  return (
    <>
      <div className="page-head">
        <h1>
          Pedido <span className="mono">{order.id}</span> <StatusBadge status={order.status} />
        </h1>
        <Link className="btn btn-ghost" to="/orders">
          Volver a pedidos
        </Link>
      </div>

      <div className="panel order-section">
        <h2>Cliente</h2>
        <dl className="customer-grid">
          <div>
            <dt>Nombre</dt>
            <dd>{order.user.name}</dd>
          </div>
          <div>
            <dt>DNI</dt>
            <dd>{order.user.dni}</dd>
          </div>
          <div>
            <dt>Teléfono</dt>
            <dd>{order.user.phone}</dd>
          </div>
          <div>
            <dt>Fecha</dt>
            <dd>{formatDate(order.createdAt)}</dd>
          </div>
        </dl>
        <a
          className="btn wa-btn"
          href={whatsappUrl(order)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Avisar por WhatsApp
        </a>
      </div>

      <div className="table-wrap order-section">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={`${item.productId}-${index}`}>
                <td>{item.name}</td>
                <td>{item.type}</td>
                <td>{item.quantity}</td>
                <td>S/ {item.price}</td>
                <td>
                  <span className="tags">
                    {item.size && <span className="tag">Talla {item.size}</span>}
                    {item.color && (
                      <span className="tag">
                        <span className="swatch" style={{ background: item.color }} />
                        {item.color}
                      </span>
                    )}
                    {item.logoPosition && (
                      <span className="tag">{logoPositionLabel(item.logoPosition)}</span>
                    )}
                  </span>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={3}></td>
              <td className="order-total" colSpan={2}>
                Total: S/ {order.total}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="panel order-section">
        <h2>Estado</h2>
        {cancelled && (
          <div className="cancel-banner" role="status">
            Este pedido fue cancelado.
          </div>
        )}
        <ol className={`stepper${cancelled ? ' cancelled' : ''}`}>
          {ORDER_FLOW.map((step, index) => {
            const currentIndex = ORDER_FLOW.indexOf(order.status);
            const state = cancelled
              ? ''
              : index < currentIndex
                ? ' done'
                : index === currentIndex
                  ? ' current'
                  : '';
            return (
              <li key={step} className={`step${state}`}>
                <span className="dot">{!cancelled && index < currentIndex ? '✓' : ''}</span>
                {STATUS_LABELS[step]}
              </li>
            );
          })}
        </ol>
        {actionError && (
          <div className="form-error" role="alert">
            {actionError}{' '}
            <button type="button" className="btn btn-ghost btn-sm" onClick={load}>
              Recargar pedido
            </button>
          </div>
        )}
        <div className="form-actions">
          {forward && (
            <button
              type="button"
              className="btn"
              disabled={busy}
              onClick={() => onForward(forward)}
            >
              {FORWARD_ACTION_LABELS[forward]}
            </button>
          )}
          {backward && (
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy}
              onClick={() => void changeStatus(backward)}
            >
              Volver a {STATUS_LABELS[backward].toLowerCase()}
            </button>
          )}
          {cancellable && (
            <button type="button" className="btn btn-danger" disabled={busy} onClick={onCancel}>
              Cancelar pedido
            </button>
          )}
          {!forward && !backward && !cancellable && (
            <p className="muted">Estado final — no hay acciones disponibles.</p>
          )}
        </div>
      </div>
    </>
  );
}
