import { useEffect } from 'react'
import type { ProductType } from '@/types/ProductType'
import { getProductImage } from '@/components/ProductVisual'
import { site } from '@/config/site'

// SEO de la ficha (spec R5.5 / design §8.3, C13): `document.title` =
// `{nombre} — devhaus.pe` y un `<script type="application/ld+json"
// id="product-jsonld">` Product con name, image, sku?, offers.{price,
// priceCurrency:'PEN', availability InStock/OutOfStock, url}. Ambos se limpian al
// desmontar (o al cambiar de producto).

export const DEFAULT_TITLE = 'devhaus.pe — Polos y accesorios para developers'
export const PRODUCT_JSONLD_ID = 'product-jsonld'

const IN_STOCK = 'https://schema.org/InStock'
const OUT_OF_STOCK = 'https://schema.org/OutOfStock'

const absolute = (url: string, origin: string): string => {
    try {
        return new URL(url, origin).href
    } catch {
        return url
    }
}

export function buildProductJsonLd(product: ProductType, origin: string): Record<string, unknown> {
    const image = getProductImage(product)
    const slug = product.slug ?? product.id ?? ''
    const jsonLd: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name ?? '',
        image: [image ? absolute(image, origin) : `${origin}/og-image.png`],
        brand: { '@type': 'Brand', name: site.brand.name },
        offers: {
            '@type': 'Offer',
            price: (product.price ?? 0).toFixed(2),
            priceCurrency: 'PEN',
            availability: product.soldOut ? OUT_OF_STOCK : IN_STOCK,
            url: `${origin}/producto/${encodeURIComponent(slug)}`
        }
    }
    if (site.product.showSku && product.id) jsonLd.sku = product.id
    return jsonLd
}

export function useProductSeo(product?: ProductType): void {
    useEffect(() => {
        if (!product) return
        document.title = `${product.name ?? 'Producto'} — devhaus.pe`
        document.getElementById(PRODUCT_JSONLD_ID)?.remove()
        const script = document.createElement('script')
        script.type = 'application/ld+json'
        script.id = PRODUCT_JSONLD_ID
        script.text = JSON.stringify(buildProductJsonLd(product, window.location.origin))
        document.head.appendChild(script)
        return () => {
            script.remove()
            document.title = DEFAULT_TITLE
        }
    }, [product?.id, product?.name, product?.price, product?.soldOut, product?.slug])
}

export default useProductSeo
