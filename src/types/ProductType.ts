import type { Cut } from '@/config/site'

export type { Cut }
export type ProductKind = 'polo' | 'taza' | 'mousepad';
export type LogoPosition = 'pocket' | 'chest' | 'back' | 'front-back';
export type CartLogoPosition = LogoPosition | 'back-chest';

export interface ProductType {
    id?: string;
    _id?: string;
    name?: string;
    price?: number;
    image?: string;
    colors?: string[];
    /** LEGADO: para polos las tallas vienen de la tabla por corte (`sizesFor(cut)`), no de aquí. */
    sizes?: string[];
    likes?: number;
    quantity?: number;
    type?: ProductKind;
    published?: boolean;
    logo?: string;
    logoPositions?: LogoPosition[];
    /** ISO 8601 (API DTO, spec R3.2). Orden "Novedades" y badge "Nuevo". */
    createdAt?: string;
    /** Slug único para `/producto/:slug` (spec R4.1). El DTO siempre lo trae. */
    slug?: string;
    /** Cortes disponibles (spec R4.1): `[]` para no-polo; polos hoy `['hombre']`. */
    cuts?: Cut[];
    /** Agotado (spec R4.1): badge "Agotado", `+` deshabilitado, el servidor rechaza el pedido. */
    soldOut?: boolean;
    /** Fotos reales (spec R5.2, futuro): "Foto con modelo" / "Detalle". Hoy el API no las envía → galería solo con mockups. */
    images?: ProductImage[];
}

export interface ProductImage {
    url: string;
    view?: 'modelo' | 'detalle';
    cut?: Cut;
    color?: string;
}

export interface ProductCartType extends ProductType{
    quantity?: number;
    size?: string;
    color?: string;
    logoPosition?: CartLogoPosition;
    /** Corte elegido (polos). Ítems anteriores a la fase 4 reciben `'hombre'` en la migración v3. */
    cut?: Cut;
}

export enum ProductCartActionType {
    ADD,
    SUM,
    REMOVE
}
