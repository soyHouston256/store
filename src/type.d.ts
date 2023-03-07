import { ProductCartActionType, ProductCartType, ProductType } from "./types/ProductType"
import { UserType } from "./types/UserType"

type OrdersState = {
    user: UserType
    total: number
}
type LikesState = {
    likedList: string[]
}

type ProductsState = {
    products: ProductType[]
    productsFiltered: ProductType[]
}

type ProductsCartState = {
    productsCart: ProductCartType[],
}

type ProductCartAction = {
    type: ProductCartActionType
    product: ProductCartType
}

type ProductsAction = {
    products?: ProductType[],
    product?: ProductType,
    term?: string
}

type LikesAction = {
    like?: string,
}

type OrderAction = {
    user?: UserType,
    total?: number
}