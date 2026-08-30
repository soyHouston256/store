export type ProductKind = 'polo' | 'taza' | 'mousepad';
export type LogoPosition = 'pocket' | 'chest' | 'back' | 'front-back';

export const PRODUCT_KINDS: ProductKind[] = ['polo', 'taza', 'mousepad'];
export const LOGO_POSITIONS: LogoPosition[] = ['pocket', 'chest', 'back', 'front-back'];

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
