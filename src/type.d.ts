import { ProductType } from "./types/ProductType"

type ProductState = {
    products: ProductType[]
}

type ProductAction = {
    type: string
    product: ProductType
}

type DispatchType = (args: ProductAction) => ProductAction