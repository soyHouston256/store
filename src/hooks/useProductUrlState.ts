import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ProductType } from '@/types/ProductType'
import { configFor } from '@/data/typeConfig'
import { cutsOf, isCut, readStoredCut } from '@/data/cuts'
import { colorKey } from '@/data/catalogFilters'
import { defaultSizeFor, sizesFor } from '@/data/sizes'
import { logoPositionsFor, normalizeLogoPosition } from '@/data/logoPositions'
import {
    ProductSelection,
    SelectionValues,
    defaultLogoPosition,
    serializeSelection
} from '@/components/product/useProductSelection'

// Estado de selección en la URL (spec R5.4 / design §8.3):
// `?corte=&color=&talla=&logo=` se lee al montar (o al cambiar de producto) y
// se escribe con `replace` cuando el usuario cambia algo, sin ensuciar el
// historial. Valores inválidos se ignoran y caen en los defaults
// (`hombre`/`colors[0]`/`M`/`chest`); si la URL traía alguno, se limpia.
// `color` viaja como slug del nombre (`negro`) o hex sin `#` (`colorKey`).

export const SELECTION_PARAMS = ['corte', 'color', 'talla', 'logo'] as const

/** URL → selección válida para el producto (defaults donde falte o sea inválido). */
export function parseSelectionParams(product: ProductType, params: URLSearchParams): SelectionValues {
    const config = configFor(product)

    const cuts = config.hasCuts ? cutsOf(product) : []
    const corte = params.get('corte')
    const stored = readStoredCut()
    const cut = cuts.length
        ? corte && isCut(corte) && cuts.includes(corte)
            ? corte
            : stored && cuts.includes(stored) ? stored : cuts[0]
        : undefined

    const colors = config.hasColors ? product.colors ?? [] : []
    const colorParam = params.get('color')?.toLowerCase()
    const color = colors.length
        ? (colorParam ? colors.find((swatch) => colorKey(swatch) === colorParam) : undefined) ?? colors[0]
        : undefined

    const sizes = config.hasSizes ? sizesFor(cut ?? 'hombre') : []
    const talla = params.get('talla')?.toUpperCase()
    const size = sizes.length
        ? talla && sizes.includes(talla) ? talla : defaultSizeFor(cut ?? 'hombre')
        : undefined

    const positions = config.hasLogoPosition ? logoPositionsFor(product) : []
    const logo = normalizeLogoPosition(params.get('logo') ?? undefined)
    const logoPosition = positions.length
        ? logo && positions.includes(logo) ? logo : defaultLogoPosition(positions)
        : undefined

    return { cut, color, size, logoPosition }
}

/** Selección → params (conserva los parámetros ajenos a la selección). */
export function selectionToParams(values: SelectionValues, base: URLSearchParams): URLSearchParams {
    const next = new URLSearchParams(base)
    for (const key of SELECTION_PARAMS) next.delete(key)
    if (values.cut) next.set('corte', values.cut)
    if (values.color) next.set('color', colorKey(values.color))
    if (values.size) next.set('talla', values.size)
    if (values.logoPosition) next.set('logo', values.logoPosition)
    return next
}

export function useProductUrlState(product: ProductType | undefined, selection: ProductSelection): void {
    const [searchParams, setSearchParams] = useSearchParams()
    const latest = useRef(searchParams)
    latest.current = searchParams
    const key = product?.id
    const initializedFor = useRef<string | undefined>(undefined)
    /** Selección serializada que la URL ya refleja. */
    const synced = useRef('')
    /** true entre `apply()` y el render en que el estado ya lo refleja. */
    const pending = useRef(false)

    // URL → selección al montar / cambiar de producto.
    useEffect(() => {
        if (!product) return
        const values = parseSelectionParams(product, latest.current)
        selection.apply(values)
        synced.current = serializeSelection(values)
        pending.current = true
        initializedFor.current = key
        const hadParams = SELECTION_PARAMS.some((param) => latest.current.has(param))
        if (hadParams) {
            const next = selectionToParams(values, latest.current)
            if (next.toString() !== latest.current.toString()) setSearchParams(next, { replace: true })
        }
    }, [key])

    // Selección → URL (`replace`) cuando el usuario cambia algo.
    const serialized = serializeSelection(selection)
    useEffect(() => {
        if (!product || initializedFor.current !== key) return
        if (pending.current) {
            if (serialized === synced.current) pending.current = false
            return
        }
        if (serialized === synced.current) return
        synced.current = serialized
        const next = selectionToParams(selection, latest.current)
        if (next.toString() !== latest.current.toString()) setSearchParams(next, { replace: true })
    }, [serialized, key])
}

export default useProductUrlState
