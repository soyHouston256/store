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
    sizes?: string[];
    likes?: number;
    quantity?: number;
    type?: ProductKind;
    published?: boolean;
    logo?: string;
    logoPositions?: LogoPosition[];
}

export interface ProductCartType extends ProductType{
    quantity?: number;
    size?: string;
    color?: string;
    logoPosition?: CartLogoPosition;
}

export enum ProductCartActionType {
    ADD,
    SUM,
    REMOVE
}
