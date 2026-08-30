import { ProductsAction, ProductsState } from '@/type';
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const applyFilters = (state: ProductsState) => {
    const { term, category } = state.filters
    state.productsFiltered = state.products.filter((p) => {
        const matchesTerm = !term || p.name?.toLowerCase().includes(term.toLowerCase())
        const matchesCategory = !category || (p.type ?? 'polo') === category
        return matchesTerm && matchesCategory
    })
}

export const productsSlice = createSlice({
    name: "products",
    initialState: {
        products: [],
        productsFiltered: [],
        filters: { term: '', category: undefined }
    } as ProductsState,
    reducers: {
        updateProduct(state, action: PayloadAction<ProductsAction>) {
            const { product } = action.payload
            const item = state.products.find((item) => item.id === product?.id);
            if (item) {
                item.likes = product?.likes
                applyFilters(state)
            }
        },
        addAllProducts(state, action: PayloadAction<ProductsAction>) {
            state.products = action.payload.products!
            applyFilters(state)
        },
        // Accepts a partial filter update (term and/or category) and merges it
        // with whatever filter is already active, so the search box and the
        // category chips can be changed independently without clobbering
        // each other.
        filterProducts(state, action: PayloadAction<ProductsAction>) {
            const { term, category } = action.payload
            if (term !== undefined) state.filters.term = term
            if (category !== undefined) state.filters.category = category === 'all' ? undefined : category
            applyFilters(state)
        }
    }
})

export const { addAllProducts, filterProducts, updateProduct } = productsSlice.actions

export default productsSlice.reducer