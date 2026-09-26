import { RootState } from '@/store'
import { setFilters } from '@/store/slices/products'
import { CatalogParam, DEFAULT_SORT, parseCatalogParams } from '@/data/catalogFilters'
import { CatalogFilters } from '@/type'
import { Dispatch, useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'

// Sincronización URL → Redux (spec R3.5, design C2 / §6.2).
//
// `useCatalogUrlSync()` se monta una vez en Products.tsx: lee `useSearchParams`,
// normaliza (ignora valores inválidos, quita `orden=vendidos` redundante),
// despacha `setFilters` y, si hubo que limpiar, reescribe la URL con `replace`
// para no ensuciar el historial. Los cambios de filtro del usuario van por
// `useCatalogParams().setParam` con `replace:false` → Atrás vuelve al filtro previo.
export function useCatalogUrlSync(): void {
    const [searchParams, setSearchParams] = useSearchParams()
    const dispatch: Dispatch<any> = useDispatch()
    const search = searchParams.toString()

    useEffect(() => {
        const { filters, normalized, changed } = parseCatalogParams(searchParams)
        dispatch(setFilters({ filters }))
        if (changed) setSearchParams(normalized, { replace: true })
    }, [search])
}

export interface CatalogParamsHandle {
    filters: CatalogFilters
    /** Escribe/borra un parámetro (`null`/`''` borra). `orden` con el default se borra. */
    setParam: (key: CatalogParam, value: string | null | undefined, options?: { replace?: boolean }) => void
    /** Quita todos los parámetros del catálogo. */
    clearAll: () => void
}

export function useCatalogParams(): CatalogParamsHandle {
    const [searchParams, setSearchParams] = useSearchParams()
    const filters = useSelector((state: RootState) => state.products.filters)
    // Ref con los params del último render: `setParam` puede dispararse desde
    // un debounce y no debe usar una copia obsoleta.
    const latest = useRef(searchParams)
    latest.current = searchParams

    const setParam = useCallback<CatalogParamsHandle['setParam']>((key, value, options) => {
        const next = new URLSearchParams(latest.current)
        const empty = value === null || value === undefined || value === '' || (key === 'orden' && value === DEFAULT_SORT)
        if (empty) next.delete(key)
        else next.set(key, value)
        if (next.toString() === latest.current.toString()) return
        setSearchParams(next, { replace: options?.replace ?? false })
    }, [setSearchParams])

    const clearAll = useCallback(() => {
        const next = new URLSearchParams(latest.current)
        for (const key of ['q', 'cat', 'orden', 'stack', 'color', 'talla'] as CatalogParam[]) next.delete(key)
        setSearchParams(next, { replace: false })
    }, [setSearchParams])

    return { filters, setParam, clearAll }
}
