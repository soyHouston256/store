import { ProductCartActionType, ProductCartType } from "./types/ProductType"

type ProductCartState = {
    list: ProductCartType[]
}

type ProductCartAction = {
    type: ProductCartActionType
    product: ProductCartType
}
