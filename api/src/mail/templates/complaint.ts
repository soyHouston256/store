import type { ComplaintDocument } from '../../models/Complaint.js';

/**
 * Plain-text + HTML rendering of a hoja de reclamación (design §5.4). The
 * same body goes to the business mailbox and, as a copy, to the consumer.
 * No business placeholders here: sender identity comes from SMTP_FROM.
 */
export interface RenderedMail {
  subject: string;
  text: string;
  html: string;
}

const CLAIM_LABELS = { reclamo: 'Reclamo', queja: 'Queja' } as const;
const KIND_LABELS = { producto: 'Producto', servicio: 'Servicio' } as const;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatAmount(amount: number | null | undefined): string | null {
  return amount == null ? null : `S/ ${amount.toFixed(2)}`;
}

export function renderComplaintMail(doc: ComplaintDocument): RenderedMail {
  const createdAt = (doc.createdAt as Date).toISOString();
  const amount = formatAmount(doc.item.amount);
  const claimLabel = CLAIM_LABELS[doc.claim.type];
  const kindLabel = KIND_LABELS[doc.item.kind];

  const rows: Array<[string, string]> = [
    ['Código', doc.code],
    ['Fecha', createdAt],
    ['Tipo', claimLabel],
    ['Consumidor', doc.consumer.name],
    ['Documento', `${doc.consumer.docType} ${doc.consumer.docNumber}`],
    ['Correo', doc.consumer.email],
    ['Teléfono', doc.consumer.phone],
    ['Domicilio', doc.consumer.address],
  ];
  if (doc.consumer.isMinor && doc.guardianName) rows.push(['Apoderado', doc.guardianName]);
  rows.push(['Bien contratado', `${kindLabel}: ${doc.item.description}`]);
  if (amount) rows.push(['Monto reclamado', amount]);
  if (doc.orderId) rows.push(['Pedido', doc.orderId]);
  rows.push(['Detalle', doc.claim.detail]);
  rows.push(['Pedido del consumidor', doc.claim.request]);

  const subject = `Libro de Reclamaciones — ${doc.code} (${claimLabel})`;

  const text = [
    `Hoja de reclamación ${doc.code}`,
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Este correo es la constancia de registro de la hoja de reclamación.',
  ].join('\n');

  const html = [
    '<!doctype html><html lang="es"><body style="font-family:system-ui,sans-serif;color:#1B1A17;line-height:1.5">',
    `<h1 style="font-size:20px;margin:0 0 16px">Hoja de reclamación <code>${escapeHtml(doc.code)}</code></h1>`,
    '<table cellpadding="6" style="border-collapse:collapse;font-size:14px">',
    ...rows.map(
      ([label, value]) =>
        `<tr><th align="left" style="color:#5E5A53;font-weight:600;vertical-align:top">${escapeHtml(label)}</th>` +
        `<td style="white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    ),
    '</table>',
    '<p style="font-size:13px;color:#5E5A53;margin-top:16px">Este correo es la constancia de registro de la hoja de reclamación.</p>',
    '</body></html>',
  ].join('');

  return { subject, text, html };
}
