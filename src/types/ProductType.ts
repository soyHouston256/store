export interface ProductType {
    id?: string;
    _id?: string;
    name?: string;
    price?: number;
    image?: string;
    colors?: string[];
    sizes?: string[];
    likes?: number;
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
