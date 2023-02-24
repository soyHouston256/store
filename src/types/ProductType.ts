export interface ProductType {
    id?: string;
    name?: string;
    price?: number;
    image?: string;
}

export interface ProductCartType extends ProductType{
    quantity?: number
}

export enum ProductCartActionType {
    ADD,
    SUM,
    REMOVE
}
