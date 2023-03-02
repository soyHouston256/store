export interface ProductType {
    id?: string;
    name?: string;
    price?: number;
    image?: string;
    colors?: string[];
    sizes?: string[];
}

export interface ProductCartType extends ProductType{
    quantity?: number;
    size?: string;
    color?: string;
}

export enum ProductCartActionType {
    ADD,
    SUM,
    REMOVE
}
