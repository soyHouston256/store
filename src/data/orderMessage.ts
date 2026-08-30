import { nearestColorName } from '@/data/colorNames'
import { LOGO_POSITION_OPTIONS, normalizeLogoPosition } from '@/data/logoPositions'
import { OrderType } from '@/types/OrderType'
import { ProductCartType, ProductKind } from '@/types/ProductType'

// WhatsApp order summary. Built with WhatsApp's native formatting (*bold*,
// _italics_, • bullets, literal \n newlines) — the caller runs it through
// encodeURIComponent when building the wa.me / api.whatsapp.com link.

const TYPE_LABELS: Record<ProductKind, string> = {
    polo: 'Polo',
    taza: 'Taza',
    mousepad: 'Mousepad'
}

// "_(Polo)_" only when it adds info: skip it if the product name already
// says so (e.g. "Mousepad Github").
const typeSuffix = (product: ProductCartType): string => {
    const label = product.type && TYPE_LABELS[product.type]
    if (!label) return ''
    const name = product.name ?? ''
    return name.toLowerCase().includes(label.toLowerCase()) ? '' : ` _(${label})_`
}

// Second line of a bullet: only the attributes the item actually has,
// joined by " · ". Empty string when there are none.
const itemAttributes = (product: ProductCartType): string => {
    const attrs: string[] = []
    if (product.size) attrs.push(`Talla ${product.size}`)
    if (product.color) attrs.push(nearestColorName(product.color) ?? product.color)
    const position = normalizeLogoPosition(product.logoPosition)
    if (position) attrs.push(LOGO_POSITION_OPTIONS[position].label)
    return attrs.join(' · ')
}

const itemLines = (product: ProductCartType): string => {
    const bullet = `• ${product.quantity ?? 1}x ${product.name}${typeSuffix(product)}`
    const attrs = itemAttributes(product)
    return attrs ? `${bullet}\n   ${attrs}` : bullet
}

export const buildOrderMessage = (order: OrderType, trackingUrl: string): string => {
    const { user, products, total, id } = order
    const detail = (products ?? []).map(itemLines).join('\n')

    return [
        `Hola ${user?.name}! 🛍️`,
        `Tu pedido *${id}* ha sido registrado en la tienda de estilos.dev.`,
        '',
        '*Detalle del pedido:*',
        detail,
        '',
        `*Total: S/ ${total}*`,
        '',
        'Sigue tu pedido aquí:',
        trackingUrl
    ].join('\n')
}
