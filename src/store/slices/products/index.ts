import { ProductCartAction, ProductsCartState } from '@/type';
import { ProductCartActionType, ProductCartType } from '@/types/ProductType';
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const productsSlice = createSlice({
    name: "products",
    initialState: {
        list: []
    } as ProductsCartState,
    reducers: {
        add(state, action: PayloadAction<ProductCartAction>) {
            const { product, type } = action.payload
            const itemInCart = state.list.find((item) => item.id === product.id);
            if (itemInCart) {
                if (type === ProductCartActionType.SUM) itemInCart.quantity! += product.quantity!
                if (type === ProductCartActionType.ADD) itemInCart.quantity! += 1;
            } else {
                state.list.push({ ...product, quantity: product.quantity || 1 });
            }
        },
        remove(state, action: PayloadAction<ProductCartAction>) {
            const newProduct: ProductCartType = action.payload.product
            const itemInCart = state.list.find((item) => item.id === newProduct.id);
            if (itemInCart) {
                if (itemInCart.quantity! > 1) itemInCart.quantity!--;
                else state.list = state.list.filter((item) => item.id !== newProduct.id);
            }
        }
    }
})

export const { add, remove } = productsSlice.actions

export default productsSlice.reducer