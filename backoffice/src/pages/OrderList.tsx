import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listOrders } from '../api/client';
import type { OrderDTO, OrderStatus } from '../api/types';
import { ORDER_STATUSES, STATUS_LABELS } from '../api/statusFlow';
import StatusBadge from '../components/StatusBadge';

type Filter = OrderStatus | 'todos';

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('todos');
  const [orders, setOrders] = useState<OrderDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setOrders(null);
    setError(null);
    listOrders(filter === 'todos' ? undefined : filter)
      .then((list) => {
        if (alive) setOrders(list);
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : 'Error al cargar pedidos');
      });
    return () => {
      alive = false;
    };
  }, [filter]);

  return (
    <>
      <div className="page-head">
        <h1>Pedidos</h1>
      </div>
      <div className="filter-tabs" role="tablist" aria-label="Filtrar por estado">
        {(['todos', ...ORDER_STATUSES] as Filter[]).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            className={`filter-tab${filter === value ? ' active' : ''}`}
            onClick={() => setFilter(value)}
          >
            {value === 'todos' ? 'Todos' : STATUS_LABELS[value]}
          </button>
        ))}
      </div>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {orders === null ? (
        !error && <p className="muted">Cargando…</p>
      ) : orders.length === 0 ? (
        <p className="muted">No hay pedidos{filter !== 'todos' ? ' con este estado' : ' todavía'}.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Ítems</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="row-link"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <td className="mono">{order.id}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    {order.user.name}
                    <div className="muted">{order.user.phone}</div>
                  </td>
                  <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                  <td>S/ {order.total}</td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
