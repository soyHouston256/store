import type { ComplaintStatus } from '../api/types';
import { COMPLAINT_STATUS_LABELS } from '../api/types';

export default function ComplaintStatusBadge({ status }: { status: ComplaintStatus }) {
  return <span className={`status-badge status-${status}`}>{COMPLAINT_STATUS_LABELS[status]}</span>;
}
