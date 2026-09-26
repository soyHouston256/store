import type { CatalogFilters, CatalogSort } from '@/type'
import type { ProductKind, ProductType } from '@/types/ProductType'
import type { Cut } from '@/config/site'
import { getProductLogoKey } from '@/data/productLogos'
import { nearestColorName } from '@/data/colorNames'

// Vocabulario del catálogo (spec R3.5 / design §6.2): parámetros de URL, sus
// valores válidos y las claves derivadas de la data (stack, color, talla).
// La URL es la fuente de verdad; Redux deriva. Todo parámetro inválido se
// ignora y se limpia de la URL (`parseCatalogParams`).

export const CATALOG_PARAMS = ['q', 'cat', 'orden', 'stack', 'color', 'talla', 'corte'] as const
export type CatalogParam = (typeof CATALOG_PARAMS)[number]

export const PRODUCT_KINDS: ProductKind[] = ['polo', 'mousepad', 'taza']
export const CATEGORY_OPTIONS: { key: ProductKind | 'all'; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'polo', label: 'Polos' },
    { key: 'mousepad', label: 'Mousepads' },
    { key: 'taza', label: 'Tazas' }
]

export const CATALOG_SORTS: CatalogSort[] = ['vendidos', 'novedades', 'precio']
export const DEFAULT_SORT: CatalogSort = 'vendidos'
export const SORT_LABELS: Record<CatalogSort, string> = {
    vendidos: 'Más vendidos',
    novedades: 'Novedades',
    precio: 'Precio: menor a mayor'
}

const CUTS: Cut[] = ['hombre', 'mujer']

export const DEFAULT_FILTERS: CatalogFilters = { term: '', sort: DEFAULT_SORT }

/** Máximo de caracteres aceptados en `q`. */
const MAX_TERM = 100

// ---------------------------------------------------------------------------
// Stack: clave de productLogos presente en la data → slug de URL (`node-js`).
// ---------------------------------------------------------------------------

const STACK_LABELS: Record<string, string> = {
    'angular': 'Angular',
    'aws': 'AWS',
    'css': 'CSS',
    'docker': 'Docker',
    'firebase': 'Firebase',
    'github': 'GitHub',
    'golang': 'Go',
    'hacker rank': 'HackerRank',
    'java': 'Java',
    'laravel': 'Laravel',
    'node.js': 'Node.js',
    'python': 'Python',
    'react': 'React',
    'redis': 'Redis',
    'redux': 'Redux',
    'spring boot': 'Spring Boot',
    'ubuntu': 'Ubuntu',
    'vue': 'Vue'
}

export const slugify = (value: string): string =>
    value
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

/** Slug de stack del producto (`docker`, `node-js`); undefined si no tiene logo local. */
export const stackOf = (product: ProductType): string | undefined => {
    const key = getProductLogoKey(product.name)
    return key ? slugify(key) : undefined
}

export const stackLabel = (slug: string): string => {
    const key = Object.keys(STACK_LABELS).find((name) => slugify(name) === slug)
    return key ? STACK_LABELS[key] : slug
}

// ---------------------------------------------------------------------------
// Color: slug del nombre más cercano (`negro`) o hex sin `#` si no es hex.
// ---------------------------------------------------------------------------

export const colorKey = (color: string): string => {
    const name = nearestColorName(color)
    if (name) return slugify(name)
    return slugify(color.replace(/^#/, '')) || color.toLowerCase()
}

export const colorLabel = (key: string, sample?: string): string => {
    const name = sample ? nearestColorName(sample) : undefined
    if (name) return name
    return key.charAt(0).toUpperCase() + key.slice(1)
}

export const productMatchesColor = (product: ProductType, key: string): boolean =>
    (product.colors ?? []).some((color) => colorKey(color) === key)

/** Color del producto que corresponde al filtro activo (para el mockup de la tarjeta), o el primero. */
export const displayColor = (product: ProductType, filterColor?: string): string | undefined => {
    const colors = product.colors ?? []
    if (filterColor) {
        const match = colors.find((color) => colorKey(color) === filterColor)
        if (match) return match
    }
    return colors[0]
}

// ---------------------------------------------------------------------------
// Talla
// ---------------------------------------------------------------------------

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

export const sortSizes = (sizes: string[]): string[] =>
    [...sizes].sort((a, b) => {
        const ia = SIZE_ORDER.indexOf(a.toUpperCase())
        const ib = SIZE_ORDER.indexOf(b.toUpperCase())
        if (ia === -1 && ib === -1) return a.localeCompare(b)
        if (ia === -1) return 1
        if (ib === -1) return -1
        return ia - ib
    })

/** `S–XXL` a partir de las tallas del producto (una sola talla → `M`). */
export const sizeRange = (sizes?: string[]): string | undefined => {
    if (!sizes || sizes.length === 0) return undefined
    const sorted = sortSizes(sizes)
    return sorted.length === 1 ? sorted[0] : `${sorted[0]}–${sorted[sorted.length - 1]}`
}

// ---------------------------------------------------------------------------
// Opciones disponibles según la data cargada
// ---------------------------------------------------------------------------

export interface FilterOption {
    value: string
    label: string
    swatch?: string
}

export const stackOptions = (products: ProductType[]): FilterOption[] => {
    const seen = new Set<string>()
    for (const product of products) {
        const slug = stackOf(product)
        if (slug) seen.add(slug)
    }
    return [...seen]
        .map((value) => ({ value, label: stackLabel(value) }))
        .sort((a, b) => a.label.localeCompare(b.label))
}

export const colorOptions = (products: ProductType[]): FilterOption[] => {
    const byKey = new Map<string, string>()
    for (const product of products) {
        for (const color of product.colors ?? []) {
            const key = colorKey(color)
            if (!byKey.has(key)) byKey.set(key, color)
        }
    }
    return [...byKey.entries()]
        .map(([value, swatch]) => ({ value, label: colorLabel(value, swatch), swatch }))
        .sort((a, b) => a.label.localeCompare(b.label))
}

export const sizeOptions = (products: ProductType[]): FilterOption[] => {
    const seen = new Set<string>()
    for (const product of products) {
        if ((product.type ?? 'polo') !== 'polo') continue
        for (const size of product.sizes ?? []) seen.add(size)
    }
    return sortSizes([...seen]).map((value) => ({ value, label: value }))
}

// ---------------------------------------------------------------------------
// URL → filtros
// ---------------------------------------------------------------------------

export interface ParsedCatalogParams {
    filters: CatalogFilters
    /** Parámetros válidos, en orden canónico; `orden=vendidos` (default) se omite. */
    normalized: URLSearchParams
    /** true si la URL tenía parámetros inválidos o redundantes que hay que limpiar. */
    changed: boolean
}

const isKind = (value: string): value is ProductKind => (PRODUCT_KINDS as string[]).includes(value)
const isSort = (value: string): value is CatalogSort => (CATALOG_SORTS as string[]).includes(value)
const isCut = (value: string): value is Cut => (CUTS as string[]).includes(value)
const isSlug = (value: string): boolean => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
const isSize = (value: string): boolean => /^[A-Za-z0-9]{1,5}$/.test(value)

export function parseCatalogParams(params: URLSearchParams): ParsedCatalogParams {
    const filters: CatalogFilters = { ...DEFAULT_FILTERS }
    const normalized = new URLSearchParams()

    const q = params.get('q')
    if (q && q.trim()) {
        filters.term = q.slice(0, MAX_TERM)
        normalized.set('q', filters.term)
    }
    const cat = params.get('cat')
    if (cat && isKind(cat)) {
        filters.category = cat
        normalized.set('cat', cat)
    }
    const corte = params.get('corte')
    if (corte && isCut(corte)) {
        filters.cut = corte
        normalized.set('corte', corte)
    }
    const orden = params.get('orden')
    if (orden && isSort(orden)) {
        filters.sort = orden
        if (orden !== DEFAULT_SORT) normalized.set('orden', orden)
    }
    const stack = params.get('stack')
    if (stack && isSlug(stack)) {
        filters.stack = stack
        normalized.set('stack', stack)
    }
    const color = params.get('color')
    if (color && isSlug(color)) {
        filters.color = color
        normalized.set('color', color)
    }
    const talla = params.get('talla')
    if (talla && isSize(talla)) {
        filters.size = talla.toUpperCase()
        normalized.set('talla', filters.size)
    }

    // Parámetros ajenos al catálogo se conservan tal cual.
    params.forEach((value, key) => {
        if (!(CATALOG_PARAMS as readonly string[]).includes(key)) normalized.append(key, value)
    })

    const changed = canonical(params) !== canonical(normalized)
    return { filters, normalized, changed }
}

const canonical = (params: URLSearchParams): string => {
    const entries: string[] = []
    params.forEach((value, key) => entries.push(`${key}=${value}`))
    return entries.sort().join('&')
}
