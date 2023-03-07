import { ProductCartAction, ProductsCartState } from '@/type';
import { ProductCartActionType, ProductCartType } from '@/types/ProductType';
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const cartSlice = createSlice({
    name: "cart",
    initialState: {
        productsCart: [],
    } as ProductsCartState,
    reducers: {
        addToCart(state, action: PayloadAction<ProductCartAction>) {
            const { product, type } = action.payload
            const itemInCart = state.productsCart.find((item) => item._id === product._id && item.color == product.color && item.size === product.size);
            if (itemInCart) {
                if (type === ProductCartActionType.SUM) itemInCart.quantity! += product.quantity!
                if (type === ProductCartActionType.ADD) itemInCart.quantity! += 1;
            } else {
                delete product?.sizes
                delete product?.colors
                state.productsCart.push({ ...product, quantity: product.quantity || 1 });
            }
        },
        removeFromCart(state, action: PayloadAction<ProductCartAction>) {
            const newProduct: ProductCartType = action.payload.product
            const itemInCart = state.productsCart.find((item) => item._id === newProduct._id);
            if (itemInCart) {
                if (itemInCart.quantity! > 1) itemInCart.quantity!--;
                else state.productsCart = state.productsCart.filter((item) => item._id !== newProduct._id);
            }
        },
        removeAllProducts(state) {
            state.productsCart = []
        },
    }
})

export const { addToCart, removeFromCart, removeAllProducts } = cartSlice.actions

export default cartSlice.reducer