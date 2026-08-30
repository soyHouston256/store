import type { OrderStatus } from '../api/types';
import { STATUS_LABELS } from '../api/statusFlow';

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`status-badge status-${status}`}>{STATUS_LABELS[status]}</span>;
}
