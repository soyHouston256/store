import { site, type Cut } from '@/config/site'
import type { ProductType } from '@/types/ProductType'
import { sizeRangeFor } from '@/data/sizes'

// Cortes de polo (spec 04 / R4.6, design C2): valores, etiquetas y meta de la
// tarjeta. El corte activo del catálogo se recuerda en `localStorage['dh-corte']` (C3).

export const CUTS: Cut[] = ['hombre', 'mujer']
export const DEFAULT_CUT: Cut = 'hombre'
export const CUT_STORAGE_KEY = 'dh-corte'

export const isCut = (value: unknown): value is Cut => typeof value === 'string' && (CUTS as string[]).includes(value)

/** Nombre visible completo: `Hombre — corte recto` / `Mujer — entallado` (tallas.json). */
export const CUT_LABELS: Record<Cut, string> = {
    hombre: site.sizes.hombre.label,
    mujer: site.sizes.mujer.label
}

/** Nombre corto para chips/segmented/mensajes: `Hombre` / `Mujer`. */
export const CUT_SHORT_LABELS: Record<Cut, string> = {
    hombre: 'Hombre',
    mujer: 'Mujer'
}

/** Descripción del corte (spec 04): `Corte recto, holgado` / `Entallado, manga corta`. */
export const CUT_DESCRIPTIONS: Record<Cut, string> = {
    hombre: site.sizes.hombre.description,
    mujer: site.sizes.mujer.description
}

const metaKind = (label: string): string => {
    // "Hombre — corte recto" → "corte recto"; "Mujer — entallado" → "entallado"
    const [, rest] = label.split('—')
    return (rest ?? '').trim()
}

/** Meta de tarjeta (spec 02 §3): `Hombre · corte recto · S–XXL` / `Mujer · entallado · XS–XL`. */
export const CUT_META: Record<Cut, string> = {
    hombre: `${CUT_SHORT_LABELS.hombre} · ${metaKind(CUT_LABELS.hombre)} · ${sizeRangeFor('hombre')}`,
    mujer: `${CUT_SHORT_LABELS.mujer} · ${metaKind(CUT_LABELS.mujer)} · ${sizeRangeFor('mujer')}`
}

/** Cortes disponibles del producto: polos sin `cuts` (legado) → `['hombre']`; no-polo → `[]`. */
export const cutsOf = (product?: ProductType): Cut[] => {
    if ((product?.type ?? 'polo') !== 'polo') return []
    const cuts = (product?.cuts ?? []).filter(isCut)
    return cuts.length ? [...new Set(cuts)] : [DEFAULT_CUT]
}

export const hasCut = (product: ProductType | undefined, cut: Cut): boolean => cutsOf(product).includes(cut)

/** Corte con el que se agrega un polo: el activo si el producto lo tiene, si no su primero. */
export const resolveCut = (product: ProductType | undefined, preferred?: Cut): Cut | undefined => {
    const cuts = cutsOf(product)
    if (cuts.length === 0) return undefined
    return preferred && cuts.includes(preferred) ? preferred : cuts[0]
}

/** Etiqueta "Solo corte hombre" para polos que no existen en el corte activo. */
export const onlyCutLabel = (product: ProductType): string => {
    const cuts = cutsOf(product)
    return `Solo corte ${cuts.map((cut) => CUT_SHORT_LABELS[cut].toLowerCase()).join(' y ')}`
}

export const readStoredCut = (): Cut | undefined => {
    try {
        const value = window.localStorage.getItem(CUT_STORAGE_KEY)
        return isCut(value) ? value : undefined
    } catch {
        return undefined
    }
}

export const storeCut = (cut: Cut): void => {
    try {
        window.localStorage.setItem(CUT_STORAGE_KEY, cut)
    } catch {
        // almacenamiento no disponible (modo privado, cuota): la preferencia no se guarda
    }
}
