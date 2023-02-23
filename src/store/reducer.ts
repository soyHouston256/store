import { ProductAction, ProductState } from "@/type"
import { ProductType } from "@/types/ProductType"
import * as actionTypes from "./actionTypes"

const initialState: ProductState = {
    products: [],
}

const reducer = (
    state: ProductState = initialState,
    action: ProductAction
): ProductState => {
    switch (action.type) {
        case actionTypes.ADD_PRODUCT:
            const newProduct: ProductType = action.product
            return {
                ...state,
                products: state.products.concat(newProduct),
            }
        case actionTypes.REMOVE_PRODUCT:
            const updatedProducts: ProductType[] = state.products.filter(
                Product => Product.id !== action.product.id
            )
            return {
                ...state,
                products: updatedProducts,
            }
    }
    return state
}

export default reducer