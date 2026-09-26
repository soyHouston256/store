import { ProductRepository } from "@/data/ProductRepository"
import { ApiError } from "@/data/http"
import { RootState } from "@/store"
import { addAllProducts, productsFailed, productsLoading, requestReload } from "@/store/slices/products"
import { Dispatch, useCallback, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

// Carga del catálogo (spec R3.1, design §6.1). Se monta UNA vez (App.tsx) y
// publica `status`/`error` en el slice `products`, así cualquier vista lee el
// estado real: shimmers solo con `loading`, bloque de error con "Reintentar"
// (`reload` → `requestReload` → nueva petición), vacío solo con data.
export const describeCatalogError = (err: unknown): string => {
    if (err instanceof ApiError) {
        return err.status >= 500
            ? 'El servidor no respondió correctamente.'
            : err.message || 'No pudimos cargar el catálogo.'
    }
    if (err instanceof TypeError) return 'No pudimos conectar con el servidor.'
    return 'No pudimos cargar el catálogo.'
}

export interface CatalogStatusHandle {
    loading: boolean
    error: string | null
    reload: () => void
}

/** Estado de carga + `reload`, sin disparar peticiones (para Products.tsx, Hero, tiles). */
export function useCatalogStatus(): CatalogStatusHandle {
    const dispatch: Dispatch<any> = useDispatch()
    const { status, error } = useSelector((state: RootState) => state.products)
    const reload = useCallback(() => dispatch(requestReload()), [dispatch])
    return { loading: status === 'loading', error, reload }
}

function useProductsList() {
    const dispatch: Dispatch<any> = useDispatch()
    const { products, reloadToken } = useSelector((state: RootState) => state.products)
    const { loading, error, reload } = useCatalogStatus()

    useEffect(() => {
        let cancelled = false
        dispatch(productsLoading())
        ;(async () => {
            try {
                const productsData = await new ProductRepository().all()
                if (!cancelled) dispatch(addAllProducts({ products: productsData }))
            } catch (err) {
                console.error(err)
                if (!cancelled) dispatch(productsFailed({ error: describeCatalogError(err) }))
            }
        })()
        return () => { cancelled = true }
    }, [reloadToken])

    return { products, loading, error, reload }
}

export default useProductsList
