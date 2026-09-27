import { site, type Cut } from '@/config/site'

// Tallas por corte (spec R4.6 / design C2). La fuente es `site.sizes`
// (copiado de docs/devhaus-handoff/specs/data/tallas.json): las tallas son
// GLOBALES por corte, no por producto — `product.sizes` es legado y no se usa
// para polos.
export const SIZES_BY_CUT: Record<Cut, string[]> = {
    hombre: site.sizes.hombre.rows.map((row) => row.talla),
    mujer: site.sizes.mujer.rows.map((row) => row.talla)
}

export const sizesFor = (cut: Cut): string[] => SIZES_BY_CUT[cut] ?? SIZES_BY_CUT.hombre

/** `S–XXL` / `XS–XL` de la tabla del corte. */
export const sizeRangeFor = (cut: Cut): string => {
    const sizes = sizesFor(cut)
    if (sizes.length === 0) return ''
    return sizes.length === 1 ? sizes[0] : `${sizes[0]}–${sizes[sizes.length - 1]}`
}

/** Talla por defecto al cambiar de corte (spec 04): `M` si existe, si no la primera. */
export const defaultSizeFor = (cut: Cut): string | undefined => {
    const sizes = sizesFor(cut)
    return sizes.includes('M') ? 'M' : sizes[0]
}
