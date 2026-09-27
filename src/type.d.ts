import { ProductCartActionType, ProductCartType, ProductKind, ProductType } from "./types/ProductType"
import { UserType } from "./types/UserType"
import { Cut } from "./config/site"

type OrdersState = {
    user: UserType
    total: number
}
type LikesState = {
    likedList: string[]
}

/** Orden del catálogo (spec R3.5): `vendidos` = likes desc (proxy), `novedades` = createdAt desc, `precio` = price asc. */
type CatalogSort = 'vendidos' | 'novedades' | 'precio'

/** Estado de carga del catálogo (spec R3.1). */
type CatalogStatus = 'loading' | 'ready' | 'error'

/**
 * Filtros del catálogo. La URL es la fuente de verdad (design C2):
 * `useCatalogUrlSync` los deriva de `?q=&cat=&orden=&stack=&color=&talla=&corte=`.
 * `cut` siempre está resuelto (URL ?? localStorage['dh-corte'] ?? 'hombre', spec R4.6):
 * no filtra polos (los que no tienen el corte muestran "Solo corte hombre"), pero
 * decide la silueta, la meta y las tallas del dropdown Talla.
 */
type CatalogFilters = {
    term: string
    category?: ProductKind
    sort: CatalogSort
    stack?: string
    color?: string
    size?: string
    cut: Cut
}

type ProductsState = {
    products: ProductType[]
    productsFiltered: ProductType[]
    filters: CatalogFilters
    status: CatalogStatus
    error: string | null
    /** Se incrementa con `requestReload` para que `useProductsList` repita la petición. */
    reloadToken: number
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
    filters?: CatalogFilters,
    error?: string
}

type LikesAction = {
    like?: string,
}

type OrderAction = {
    user?: UserType,
    total?: number
}