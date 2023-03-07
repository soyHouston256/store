import { ProductCartAction, ProductsAction, ProductsState } from '@/type';
import { ProductCartActionType, ProductCartType } from '@/types/ProductType';
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const productsSlice = createSlice({
    name: "products",
    initialState: {
        productsCart: [],
        products: [],
        productsFiltered: []
    } as ProductsState,
    reducers: {
        addToCart(state, action: PayloadAction<ProductCartAction>) {
            const { product, type } = action.payload
            const itemInCart = state.productsCart.find((item) => item.id === product.id && item.color == product.color && item.size === product.size);
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
            const itemInCart = state.productsCart.find((item) => item.id === newProduct.id);
            if (itemInCart) {
                if (itemInCart.quantity! > 1) itemInCart.quantity!--;
                else state.productsCart = state.productsCart.filter((item) => item.id !== newProduct.id);
            }
        },
        addAllProducts(state, action: PayloadAction<ProductsAction>) { 
            state.products = action.payload.products!
            state.productsFiltered = action.payload.products!
        },
        removeAllProducts(state) {
            state.productsCart = []
        },
        filterProducts(state, action: PayloadAction<ProductsAction>) {
            const term = action.payload.term
            state.productsFiltered = state.products.filter(p => p.name?.toLowerCase().includes(term!.toLowerCase()))
        }
    }
})

export const { addToCart, removeFromCart, addAllProducts, removeAllProducts, filterProducts } = productsSlice.actions

export default productsSlice.reducer