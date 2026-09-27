import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Cut, LogoPosition, ProductCartType, ProductType } from '@/types/ProductType'
import { configFor, RequiredField, TypeConfig } from '@/data/typeConfig'
import { isBackLogoPosition, logoPositionsFor } from '@/data/logoPositions'
import { cutsOf, readStoredCut, resolveCut, storeCut } from '@/data/cuts'
import { defaultSizeFor, sizesFor } from '@/data/sizes'
import { MAX_CART_QUANTITY } from '@/store/slices/products/cart'

// Estado de selección de la ficha (design §8.2 / spec R5.3), extraído del modal
// `views/Product.tsx` (fase ≤4). Conserva el comportamiento central (spec R0.2):
// elegir una posición de logo trasera ("Espalda", "Bolsillo + espalda") gira el
// mockup (`isFlipped = isBackLogoPosition(position)`); cambiar de corte resetea
// la talla a `M` si la actual no existe en el nuevo corte (spec 04); la cantidad
// va de 1 a `MAX_CART_QUANTITY` (10). `apply()` lo usa `useProductUrlState`
// para inyectar la selección del deep link (`?corte=&color=&talla=&logo=`).

export interface SelectionValues {
    cut?: Cut
    color?: string
    size?: string
    logoPosition?: LogoPosition
}

export interface ProductSelection extends SelectionValues {
    isFlipped: boolean
    quantity: number
    config: TypeConfig
    soldOut: boolean
    availableCuts: Cut[]
    availableSizes: string[]
    availableLogoPositions: LogoPosition[]
    /** Campos requeridos por el tipo que aún no tienen valor. */
    missingFields: RequiredField[]
    canAdd: boolean
    selectCut: (cut: Cut) => void
    selectColor: (color: string) => void
    selectSize: (size: string) => void
    selectLogoPosition: (position: LogoPosition) => void
    setFlipped: (flipped: boolean) => void
    toggleFlip: () => void
    increment: () => void
    decrement: () => void
    /** Reemplaza cut/color/size/logoPosition de golpe (deep link). */
    apply: (values: SelectionValues) => void
    /** Línea de carrito con la selección actual; `undefined` si falta algo o está agotado. */
    toCartItem: () => ProductCartType | undefined
}

/** Posición por defecto (spec R5.4): `chest` si existe, si no la primera disponible. */
export const defaultLogoPosition = (positions: LogoPosition[]): LogoPosition | undefined =>
    positions.length ? (positions.includes('chest') ? 'chest' : positions[0]) : undefined

/**
 * Selección inicial sin URL (spec R5.4): corte = preferido/`localStorage['dh-corte']`
 * si el producto lo tiene (si no su primero), `colors[0]`, talla `M` del corte,
 * logo `chest`. Tipos sin la característica reciben `undefined`.
 */
export function defaultSelection(product: ProductType | undefined, preferredCut?: Cut): SelectionValues {
    const config = configFor(product)
    const cut = config.hasCuts ? resolveCut(product, preferredCut ?? readStoredCut()) : undefined
    return {
        cut,
        color: config.hasColors ? product?.colors?.[0] : undefined,
        size: config.hasSizes ? defaultSizeFor(cut ?? 'hombre') : undefined,
        logoPosition: config.hasLogoPosition ? defaultLogoPosition(logoPositionsFor(product)) : undefined
    }
}

export const serializeSelection = (values: SelectionValues): string =>
    [values.cut ?? '', values.color ?? '', values.size ?? '', values.logoPosition ?? ''].join('|')

export function useProductSelection(product?: ProductType): ProductSelection {
    const [values, setValues] = useState<SelectionValues>({})
    const [isFlipped, setIsFlipped] = useState(false)
    const [quantity, setQuantity] = useState(1)

    const config = configFor(product)
    const soldOut = Boolean(product?.soldOut)
    const availableCuts = useMemo(() => (config.hasCuts ? cutsOf(product) : []), [product, config.hasCuts])
    const availableLogoPositions = useMemo(
        () => (config.hasLogoPosition ? logoPositionsFor(product) : []),
        [product, config.hasLogoPosition]
    )
    const availableSizes = config.hasSizes ? sizesFor(values.cut ?? availableCuts[0] ?? 'hombre') : []

    // Nuevo producto (o primera carga): selección por defecto, frente, cantidad 1.
    useEffect(() => {
        if (!product) return
        setValues(defaultSelection(product))
        setIsFlipped(false)
        setQuantity(1)
    }, [product?.id])

    const apply = useCallback((next: SelectionValues) => {
        setValues(next)
        setIsFlipped(isBackLogoPosition(next.logoPosition))
    }, [])

    const selectCut = useCallback((cut: Cut) => {
        storeCut(cut)
        setValues((current) => {
            if (current.cut === cut) return current
            const size = current.size && sizesFor(cut).includes(current.size) ? current.size : defaultSizeFor(cut)
            return { ...current, cut, size }
        })
    }, [])

    const selectColor = useCallback((color: string) => setValues((current) => ({ ...current, color })), [])
    const selectSize = useCallback((size: string) => setValues((current) => ({ ...current, size })), [])

    const selectLogoPosition = useCallback((logoPosition: LogoPosition) => {
        setValues((current) => ({ ...current, logoPosition }))
        setIsFlipped(isBackLogoPosition(logoPosition))
    }, [])

    const toggleFlip = useCallback(() => setIsFlipped((current) => !current), [])
    const increment = useCallback(() => setQuantity((current) => Math.min(MAX_CART_QUANTITY, current + 1)), [])
    const decrement = useCallback(() => setQuantity((current) => Math.max(1, current - 1)), [])

    const missingFields = config.required.filter((field) => {
        if (field === 'logoPosition') return availableLogoPositions.length > 0 && !values.logoPosition
        if (field === 'cut') return availableCuts.length > 0 && !values.cut
        return !values[field]
    })
    const canAdd = Boolean(product) && !soldOut && missingFields.length === 0

    const toCartItem = useCallback((): ProductCartType | undefined => {
        if (!product || !canAdd) return undefined
        return { ...product, quantity, cut: values.cut, size: values.size, color: values.color, logoPosition: values.logoPosition }
    }, [product, canAdd, quantity, values])

    return {
        ...values,
        isFlipped,
        quantity,
        config,
        soldOut,
        availableCuts,
        availableSizes,
        availableLogoPositions,
        missingFields,
        canAdd,
        selectCut,
        selectColor,
        selectSize,
        selectLogoPosition,
        setFlipped: setIsFlipped,
        toggleFlip,
        increment,
        decrement,
        apply,
        toCartItem
    }
}

export default useProductSelection
