import { ProductCartActionType, ProductCartType } from "./types/ProductType"
import { UserType } from "./types/UserType"

type OrdersState = {
    user: UserType
    total: number
}

type ProductsCartState = {
    list: ProductCartType[]
}

type ProductCartAction = {
    type: ProductCartActionType
    product: ProductCartType
}

type OrderAction = {
    user?: UserType,
    total?: number
}