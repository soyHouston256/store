import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

/**
 * Libro de Reclamaciones (spec R2b.1 / design §5.1, field names per
 * conciliación C4). One document per hoja de reclamación; `code` is the
 * per-year correlativo (`LR-2026-000001`) and is unique. Business record:
 * no TTL, `{createdAt: -1}` index for the admin list.
 */
export const DOC_TYPES = ['DNI', 'CE', 'PASAPORTE'] as const;
export const ITEM_KINDS = ['producto', 'servicio'] as const;
export const CLAIM_TYPES = ['reclamo', 'queja'] as const;
export const COMPLAINT_STATUSES = ['nuevo', 'atendido'] as const;

export type DocType = (typeof DOC_TYPES)[number];
export type ItemKind = (typeof ITEM_KINDS)[number];
export type ClaimType = (typeof CLAIM_TYPES)[number];
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

const ConsumerSchema = new Schema(
  {
    name: { type: String, required: true },
    docType: { type: String, enum: DOC_TYPES, required: true },
    docNumber: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    isMinor: { type: Boolean, default: false },
  },
  { _id: false },
);

const ItemSchema = new Schema(
  {
    kind: { type: String, enum: ITEM_KINDS, required: true },
    description: { type: String, required: true },
    amount: { type: Number, min: 0 },
  },
  { _id: false },
);

const ClaimSchema = new Schema(
  {
    type: { type: String, enum: CLAIM_TYPES, required: true },
    detail: { type: String, required: true },
    request: { type: String, required: true },
  },
  { _id: false },
);

const ComplaintSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    consumer: { type: ConsumerSchema, required: true },
    guardianName: { type: String },
    item: { type: ItemSchema, required: true },
    claim: { type: ClaimSchema, required: true },
    orderId: { type: String },
    status: { type: String, enum: COMPLAINT_STATUSES, default: 'nuevo' },
    emailSent: { type: Boolean, default: false },
    ip: { type: String },
  },
  { timestamps: true },
);

ComplaintSchema.index({ createdAt: -1 });

export type ComplaintAttrs = InferSchemaType<typeof ComplaintSchema>;
export type ComplaintDocument = HydratedDocument<ComplaintAttrs>;

export const Complaint = model('Complaint', ComplaintSchema);

/** `LR-2026-000001` — prefix, four-digit year, zero-padded 6-digit sequence. */
export function formatCode(prefix: string, year: number, seq: number): string {
  return `${prefix}-${year}-${String(seq).padStart(6, '0')}`;
}

/** Counter key per year so the correlativo restarts every January (design §5.1). */
export function counterKeyFor(year: number): string {
  return `complaints-${year}`;
}

export interface ComplaintDTO {
  id: string;
  code: string;
  consumer: {
    name: string;
    docType: DocType;
    docNumber: string;
    email: string;
    phone: string;
    address: string;
    isMinor: boolean;
  };
  guardianName?: string;
  item: { kind: ItemKind; description: string; amount?: number };
  claim: { type: ClaimType; detail: string; request: string };
  orderId?: string;
  status: ComplaintStatus;
  emailSent: boolean;
  /** ISO date */
  createdAt: string;
  /** ISO date */
  updatedAt: string;
}

export function toComplaintDTO(doc: ComplaintDocument): ComplaintDTO {
  return {
    id: doc._id.toString(),
    code: doc.code,
    consumer: {
      name: doc.consumer.name,
      docType: doc.consumer.docType,
      docNumber: doc.consumer.docNumber,
      email: doc.consumer.email,
      phone: doc.consumer.phone,
      address: doc.consumer.address,
      isMinor: doc.consumer.isMinor ?? false,
    },
    ...(doc.guardianName != null ? { guardianName: doc.guardianName } : {}),
    item: {
      kind: doc.item.kind,
      description: doc.item.description,
      ...(doc.item.amount != null ? { amount: doc.item.amount } : {}),
    },
    claim: { type: doc.claim.type, detail: doc.claim.detail, request: doc.claim.request },
    ...(doc.orderId != null ? { orderId: doc.orderId } : {}),
    status: doc.status,
    emailSent: doc.emailSent ?? false,
    createdAt: (doc.createdAt as Date).toISOString(),
    updatedAt: (doc.updatedAt as Date).toISOString(),
  };
}
