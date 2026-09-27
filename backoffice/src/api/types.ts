export type ProductKind = 'polo' | 'taza' | 'mousepad';
export type LogoPosition = 'pocket' | 'chest' | 'back' | 'front-back';

export const PRODUCT_KINDS: ProductKind[] = ['polo', 'taza', 'mousepad'];
export const LOGO_POSITIONS: LogoPosition[] = ['pocket', 'chest', 'back', 'front-back'];

/** Polo cuts (phase 4, spec 04). Non-polos always have `cuts: []`. */
export type Cut = 'hombre' | 'mujer';
export const CUTS: Cut[] = ['hombre', 'mujer'];
export const CUT_LABELS: Record<Cut, string> = { hombre: 'Hombre', mujer: 'Mujer' };
export const CUT_OPTIONS: Array<{ value: Cut; label: string; description: string }> = [
  { value: 'hombre', label: 'Corte hombre', description: 'Corte recto, holgado · S–XXL' },
  { value: 'mujer', label: 'Corte mujer', description: 'Entallado, manga corta · XS–XL' },
];

export const LOGO_POSITION_OPTIONS: Array<{ value: LogoPosition; label: string; description: string }> = [
  { value: 'pocket', label: 'Bolsillo delantero', description: 'Logo pequeño al frente.' },
  { value: 'chest', label: 'Pecho', description: 'Logo grande centrado al frente.' },
  { value: 'back', label: 'Espalda', description: 'Logo grande solo en la espalda.' },
  { value: 'front-back', label: 'Bolsillo + espalda', description: 'Logo pequeño delante y grande atrás.' },
];

export interface ProductDTO {
  id: string;
  name: string;
  price: number;
  type: ProductKind;
  colors: string[];
  sizes: string[];
  logoPositions: LogoPosition[];
  likes: number;
  published: boolean;
  /** URL handle (`/producto/:slug`); legacy rows without one are served with their id */
  slug: string;
  /** `[]` for non-polos */
  cuts: Cut[];
  soldOut: boolean;
  /** ISO date */
  createdAt: string;
  /** legacy Firebase URL (read-only) */
  image?: string;
  /** relative "/uploads/<file>" path — prefix with VITE_API_URL */
  logo?: string;
}

export interface ProductWriteDTO {
  name: string;
  price: number;
  type: ProductKind;
  colors: string[];
  sizes: string[];
  logoPositions: LogoPosition[];
  /** omitted → POST generates it from the name, PUT keeps the stored one */
  slug?: string;
  /** polos only (the API forces `[]` for other types) */
  cuts?: Cut[];
  soldOut: boolean;
}

export interface FieldError {
  field: string;
  message: string;
}

// ---- orders ----

export type OrderStatus =
  | 'pendiente'
  | 'confirmado'
  | 'pagado'
  | 'preparado'
  | 'enviado'
  | 'recibido'
  | 'finalizado'
  | 'cancelado';

export interface OrderUserDTO {
  dni: string;
  name: string;
  phone: string;
}

export interface OrderItemDTO {
  productId: string;
  name: string;
  type: ProductKind;
  price: number;
  quantity: number;
  /** polos only */
  cut?: Cut;
  size?: string;
  color?: string;
  logoPosition?: LogoPosition;
}

export interface OrderDTO {
  id: string;
  user: OrderUserDTO;
  items: OrderItemDTO[];
  total: number;
  status: OrderStatus;
  /** ISO date */
  createdAt: string;
}

// ---- complaints (Libro de Reclamaciones, spec R2b / C4) ----

export type ComplaintStatus = 'nuevo' | 'atendido';
export type ComplaintDocType = 'DNI' | 'CE' | 'PASAPORTE';
export type ComplaintItemKind = 'producto' | 'servicio';
export type ComplaintType = 'reclamo' | 'queja';

export const COMPLAINT_STATUSES: ComplaintStatus[] = ['nuevo', 'atendido'];
export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  nuevo: 'Nuevo',
  atendido: 'Atendido',
};
export const COMPLAINT_TYPE_LABELS: Record<ComplaintType, string> = {
  reclamo: 'Reclamo',
  queja: 'Queja',
};
export const COMPLAINT_KIND_LABELS: Record<ComplaintItemKind, string> = {
  producto: 'Producto',
  servicio: 'Servicio',
};
export const COMPLAINT_DOC_TYPE_LABELS: Record<ComplaintDocType, string> = {
  DNI: 'DNI',
  CE: 'Carné de extranjería',
  PASAPORTE: 'Pasaporte',
};

export interface ComplaintDTO {
  id: string;
  /** Correlativo `LR-2026-000001` */
  code: string;
  consumer: {
    name: string;
    docType: ComplaintDocType;
    docNumber: string;
    email: string;
    phone: string;
    address: string;
    isMinor: boolean;
  };
  /** present when the consumer is a minor */
  guardianName?: string;
  item: { kind: ComplaintItemKind; description: string; amount?: number };
  claim: { type: ComplaintType; detail: string; request: string };
  /** 8-char order code, when the consumer linked one */
  orderId?: string;
  status: ComplaintStatus;
  emailSent: boolean;
  /** ISO date */
  createdAt: string;
  /** ISO date */
  updatedAt: string;
}
