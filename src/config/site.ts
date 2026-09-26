// devhaus.pe — configuración de negocio centralizada (spec R0.1 / design §3.4).
//
// Todo dato de negocio que el diseño entrega entre [CORCHETES] vive aquí.
// Cada valor pendiente vale `null` (escalar / texto) o `[]` (lista) y lleva un
// `// TODO(spec-05)`: NUNCA se inventa un valor. El fragmento de UI que dependa
// de una clave pendiente se oculta con `isConfigured(key)` (o usa el fallback
// indicado en la tabla de spec R0.1).
//
// Las medidas de tallas (`sizes`) se copian de docs/devhaus-handoff/specs/data/tallas.json
// con los cm en `null` hasta que el proveedor las confirme.

export type Cut = 'hombre' | 'mujer'

export interface SizeRow {
    talla: string
    anchoPechoCm: number | null
    largoCm: number | null
}

export interface SizeTable {
    label: string
    description: string
    rows: SizeRow[]
}

export interface SiteConfig {
    brand: {
        name: 'devhaus.pe'
        domain: string
        tagline: string
    }
    legal: {
        businessName: string | null
        ruc: string | null
        termsText: string[] | null
        privacyText: string[] | null
    }
    complaints: {
        /** Plazo legal de respuesta (días) mostrado en el Libro de Reclamaciones. */
        responseDays: number | null
    }
    contact: {
        /** E.164 sin `+`. `VITE_WHATSAPP_NUMBER` lo sobreescribe; sin ninguno los CTA de WhatsApp se ocultan. */
        whatsapp: string | null
        hours: string | null
    }
    social: {
        instagram: string | null
        tiktok: string | null
        other: { label: string; url: string }[]
    }
    shipping: {
        courier: string | null
        hasTracking: boolean | null
        limaDays: number | null
        provinceDays: number | null
        freeFrom: number | null
    }
    payments: {
        gateway: string | null
        yapePlinIntegrated: boolean | null
    }
    product: {
        material: string | null
        grammage: string | null
        prewashed: boolean | null
        printTechnique: string | null
        mousepadSize: string | null
        mugMl: number | null
        showSku: boolean
        modelHeightCm: number | null
        modelSize: string | null
    }
    sizes: Record<Cut, SizeTable>
    customization: {
        fromPrice: number
        priceIsSurcharge: boolean | null
        mockupHours: number | null
    }
    returns: {
        days: number | null
        conditions: string | null
    }
    promos: {
        freeStickers: number | null
    }
    reviews: {
        source: string | null
    }
}

export const site: SiteConfig = {
    brand: {
        name: 'devhaus.pe',
        domain: 'devhaus.pe',
        tagline: 'Polos y accesorios para developers'
    },
    legal: {
        businessName: null, // TODO(spec-05) razón social
        ruc: null, // TODO(spec-05) RUC
        termsText: null, // TODO(spec-05) Términos y condiciones (párrafos)
        privacyText: null // TODO(spec-05) Política de privacidad (párrafos)
    },
    complaints: {
        responseDays: null // TODO(spec-05) plazo de respuesta del Libro de Reclamaciones
    },
    contact: {
        whatsapp: null, // TODO(spec-05) número de WhatsApp (E.164 sin "+")
        hours: null // TODO(spec-05) horario de atención
    },
    social: {
        instagram: null, // TODO(spec-05) URL de Instagram
        tiktok: null, // TODO(spec-05) URL de TikTok
        other: [] // TODO(spec-05) otras redes [{ label, url }]
    },
    shipping: {
        courier: null, // TODO(spec-05) courier(s)
        hasTracking: null, // TODO(spec-05) ¿hay código de seguimiento?
        limaDays: null, // TODO(spec-05) días hábiles Lima
        provinceDays: null, // TODO(spec-05) días hábiles Provincias
        freeFrom: null // TODO(spec-05) monto de envío gratis (S/), o dejar null para no mostrar
    },
    payments: {
        gateway: null, // TODO(spec-05) pasarela de tarjetas (Culqi, Izipay, Mercado Pago, Niubiz…)
        yapePlinIntegrated: null // TODO(spec-05) ¿Yape/Plin integrado o manual?
    },
    product: {
        material: null, // TODO(spec-05) material de la tela
        grammage: null, // TODO(spec-05) gramaje (g/m²)
        prewashed: null, // TODO(spec-05) ¿tela prelavada?
        printTechnique: null, // TODO(spec-05) técnica de estampado (DTF, serigrafía, sublimación…)
        mousepadSize: null, // TODO(spec-05) medidas del mousepad
        mugMl: null, // TODO(spec-05) capacidad de la taza (ml)
        showSku: false,
        modelHeightCm: null, // TODO(spec-05) estatura del modelo de las fotos
        modelSize: null // TODO(spec-05) talla que usa el modelo
    },
    sizes: {
        hombre: {
            label: 'Hombre — corte recto',
            description: 'Corte recto, holgado',
            rows: [
                { talla: 'S', anchoPechoCm: null, largoCm: null }, // TODO(spec-05) medidas en cm
                { talla: 'M', anchoPechoCm: null, largoCm: null }, // TODO(spec-05) medidas en cm
                { talla: 'L', anchoPechoCm: null, largoCm: null }, // TODO(spec-05) medidas en cm
                { talla: 'XL', anchoPechoCm: null, largoCm: null }, // TODO(spec-05) medidas en cm
                { talla: 'XXL', anchoPechoCm: null, largoCm: null } // TODO(spec-05) medidas en cm
            ]
        },
        mujer: {
            label: 'Mujer — entallado',
            description: 'Entallado, manga corta',
            rows: [
                { talla: 'XS', anchoPechoCm: null, largoCm: null }, // TODO(spec-05) medidas en cm
                { talla: 'S', anchoPechoCm: null, largoCm: null }, // TODO(spec-05) medidas en cm
                { talla: 'M', anchoPechoCm: null, largoCm: null }, // TODO(spec-05) medidas en cm
                { talla: 'L', anchoPechoCm: null, largoCm: null }, // TODO(spec-05) medidas en cm
                { talla: 'XL', anchoPechoCm: null, largoCm: null } // TODO(spec-05) medidas en cm
            ]
        }
    },
    customization: {
        fromPrice: 15, // valor entregado por diseño ("Personaliza desde S/ 15")
        priceIsSurcharge: null, // TODO(spec-05) ¿S/ 15 es recargo o precio de producto?
        mockupHours: null // TODO(spec-05) horas de entrega del mockup
    },
    returns: {
        days: null, // TODO(spec-05) días para cambios/devoluciones
        conditions: null // TODO(spec-05) condiciones de cambio
    },
    promos: {
        freeStickers: null // TODO(spec-05) stickers gratis por pedido (hoy "4" hardcodeado en CartOrder.tsx)
    },
    reviews: {
        source: null // TODO(spec-05) fuente de reseñas reales
    }
}

// ---------------------------------------------------------------------------
// Claves tipadas: `Paths<SiteConfig>` genera la unión de rutas con punto
// ('shipping.freeFrom', 'sizes.hombre.rows', …). Un acceso a una clave que no
// existe falla en compilación (spec R1.1).
// ---------------------------------------------------------------------------

type Paths<T, P extends string = ''> = {
    [K in keyof T & string]: T[K] extends object
        ? T[K] extends any[]
            ? `${P}${K}`
            : Paths<T[K], `${P}${K}.`>
        : `${P}${K}`
}[keyof T & string]

export type SiteKey = Paths<SiteConfig>

/** true si el valor no es `null`/`undefined`, no es `''` ni `[]` y (número) no es `NaN`. */
export function has(value: unknown): boolean {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim() !== ''
    if (typeof value === 'number') return !Number.isNaN(value)
    if (Array.isArray(value)) return value.length > 0
    return true
}

/** Lee una clave por ruta ('shipping.freeFrom'). Devuelve `unknown`: castear en el punto de uso. */
export function get<K extends SiteKey>(key: K): unknown {
    return key.split('.').reduce<unknown>((node, part) => {
        if (node === null || node === undefined) return undefined
        return (node as Record<string, unknown>)[part]
    }, site)
}

const isSizeRows = (value: unknown): value is SizeRow[] =>
    Array.isArray(value) && value.every((row) => row !== null && typeof row === 'object' && 'talla' in row)

/**
 * true solo si el valor existe (`has`). Para las tablas de medidas
 * (`sizes.<corte>.rows`) es true solo si TODAS las filas tienen ambos cm.
 */
export function isConfigured(key: SiteKey): boolean {
    const value = get(key)
    if (isSizeRows(value)) {
        return value.length > 0 && value.every((row) => has(row.anchoPechoCm) && has(row.largoCm))
    }
    return has(value)
}
