import { CatalogFilters, ProductsAction, ProductsState } from '@/type';
import { ProductType } from '@/types/ProductType';
import { DEFAULT_FILTERS, productMatchesColor, stackOf } from '@/data/catalogFilters';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

// Catálogo (spec R3.1 / R3.5, design §6): la URL es la fuente de verdad de los
// filtros — `useCatalogUrlSync` los parsea y llama `setFilters`; los componentes
// de filtro nunca despachan directamente. `status`/`error`/`reloadToken` los
// maneja `useProductsList`.

const createdAtMs = (product: ProductType): number => {
    const time = product.createdAt ? Date.parse(product.createdAt) : NaN
    return Number.isNaN(time) ? 0 : time
}

const byName = (a: ProductType, b: ProductType) => (a.name ?? '').localeCompare(b.name ?? '')

const comparators: Record<CatalogFilters['sort'], (a: ProductType, b: ProductType) => number> = {
    // "Más vendidos": likes desc (proxy documentado, spec R3.5)
    vendidos: (a, b) => ((b.likes ?? 0) - (a.likes ?? 0)) || byName(a, b),
    novedades: (a, b) => (createdAtMs(b) - createdAtMs(a)) || byName(a, b),
    precio: (a, b) => ((a.price ?? 0) - (b.price ?? 0)) || byName(a, b)
}

export const applyFilters = (state: ProductsState) => {
    const { term, category, sort, stack, color, size } = state.filters
    const needle = term.trim().toLowerCase()
    const filtered = state.products.filter((p) => {
        const kind = p.type ?? 'polo'
        if (needle && !(p.name ?? '').toLowerCase().includes(needle)) return false
        if (category && kind !== category) return false
        if (stack && stackOf(p) !== stack) return false
        if (color && !productMatchesColor(p, color)) return false
        // La talla es por tabla, no por producto: solo restringe polos (design §6.2).
        if (size && kind === 'polo' && !(p.sizes ?? []).some((s) => s.toUpperCase() === size)) return false
        return true
    })
    state.productsFiltered = filtered.sort(comparators[sort] ?? comparators.vendidos)
}

export const productsSlice = createSlice({
    name: "products",
    initialState: {
        products: [],
        productsFiltered: [],
        filters: { ...DEFAULT_FILTERS },
        status: 'loading',
        error: null,
        reloadToken: 0
    } as ProductsState,
    reducers: {
        productsLoading(state) {
            state.status = 'loading'
            state.error = null
        },
        productsFailed(state, action: PayloadAction<ProductsAction>) {
            state.status = 'error'
            state.error = action.payload.error ?? 'No pudimos cargar el catálogo.'
        },
        requestReload(state) {
            state.reloadToken += 1
        },
        updateProduct(state, action: PayloadAction<ProductsAction>) {
            const { product } = action.payload
            const item = state.products.find((item) => item.id === product?.id);
            if (item) {
                item.likes = product?.likes
                applyFilters(state)
            }
        },
        addAllProducts(state, action: PayloadAction<ProductsAction>) {
            state.products = action.payload.products ?? []
            state.status = 'ready'
            state.error = null
            applyFilters(state)
        },
        /** Reemplaza los filtros completos (derivados de la URL) y recalcula. */
        setFilters(state, action: PayloadAction<ProductsAction>) {
            state.filters = { ...DEFAULT_FILTERS, ...(action.payload.filters ?? {}) }
            applyFilters(state)
        }
    }
})

export const { addAllProducts, setFilters, updateProduct, productsLoading, productsFailed, requestReload } = productsSlice.actions

export default productsSlice.reducer

/** Máximo de badges "Más vendido" (spec C13: top 3 de likes del catálogo cargado). */
export const BEST_SELLERS_COUNT = 3

/** Ids de los 3 productos con más likes (> 0) del catálogo cargado (spec R3.6 / C13). */
export const selectBestSellerIds = createSelector(
    (state: { products: ProductsState }) => state.products.products,
    (products): string[] =>
        products
            .filter((product) => product.id !== undefined && (product.likes ?? 0) > 0)
            .sort((a, b) => ((b.likes ?? 0) - (a.likes ?? 0)) || byName(a, b))
            .slice(0, BEST_SELLERS_COUNT)
            .map((product) => product.id as string)
)
