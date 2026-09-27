import { ProductRepository } from '@/data/ProductRepository'
import { ApiError } from '@/data/http'
import { ProductType } from '@/types/ProductType'
import { useEffect, useState } from 'react'

// Carga de un producto por id o slug (spec R5.1 / design §8.2): `GET
// /api/products/:idOrSlug` acepta ambos (R4.2). Reemplaza a `useProductById`
// (que no reaccionaba al cambio de id ni distinguía 404). `notFound` separa el
// 404 del resto de errores para que la ficha muestre "No encontramos ese producto".
export interface UseProductResult {
    product?: ProductType
    loading: boolean
    /** Mensaje de error de red/servidor (no 404). */
    error: string | null
    /** 404 `NOT_FOUND`: slug desconocido o producto no publicado. */
    notFound: boolean
}

const describeError = (err: unknown): string => {
    if (err instanceof ApiError) {
        return err.status >= 500 ? 'El servidor no respondió correctamente.' : err.message || 'No pudimos cargar el producto.'
    }
    if (err instanceof TypeError) return 'No pudimos conectar con el servidor.'
    return 'No pudimos cargar el producto.'
}

function useProduct(idOrSlug?: string): UseProductResult {
    const [state, setState] = useState<UseProductResult>({ loading: Boolean(idOrSlug), error: null, notFound: !idOrSlug })

    useEffect(() => {
        if (!idOrSlug) {
            setState({ loading: false, error: null, notFound: true })
            return
        }
        let cancelled = false
        setState({ loading: true, error: null, notFound: false })
        ;(async () => {
            try {
                const product = await new ProductRepository().find(idOrSlug)
                if (!cancelled) setState({ product, loading: false, error: null, notFound: false })
            } catch (err) {
                if (cancelled) return
                const notFound = err instanceof ApiError && err.status === 404
                if (!notFound) console.error(err)
                setState({ loading: false, error: notFound ? null : describeError(err), notFound })
            }
        })()
        return () => { cancelled = true }
    }, [idOrSlug])

    return state
}

export default useProduct
