import { ProductsAction, ProductsState } from '@/type';
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const productsSlice = createSlice({
    name: "products",
    initialState: {
        products: [],
        productsFiltered: []
    } as ProductsState,
    reducers: {
        addAllProducts(state, action: PayloadAction<ProductsAction>) { 
            state.products = action.payload.products!
            state.productsFiltered = action.payload.products!
        },
        filterProducts(state, action: PayloadAction<ProductsAction>) {
            const term = action.payload.term
            state.productsFiltered = state.products.filter(p => p.name?.toLowerCase().includes(term!.toLowerCase()))
        }
    }
})

export const { addAllProducts, filterProducts } = productsSlice.actions

export default productsSlice.reducer