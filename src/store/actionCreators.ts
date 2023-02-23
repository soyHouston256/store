import { DispatchType, ProductAction } from "@/type"
import { ProductType } from "@/types/ProductType"
import * as actionTypes from "./actionTypes"

export function addProduct(product: ProductType) {
    const action: ProductAction = {
        type: actionTypes.ADD_PRODUCT,
        product,
    }

    return simulateHttpRequest(action)
}

export function removeProduct(product: ProductType) {
    const action: ProductAction = {
        type: actionTypes.REMOVE_PRODUCT,
        product,
    }
    return simulateHttpRequest(action)
}

export function simulateHttpRequest(action: ProductAction) {
    return (dispatch: DispatchType) => {
        setTimeout(() => {
            dispatch(action)
        }, 500)
    }
}