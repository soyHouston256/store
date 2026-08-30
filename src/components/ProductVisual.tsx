import type { CartLogoPosition, ProductType } from '@/types/ProductType'
import { configFor } from '@/data/typeConfig'
import { getProductLogo } from '@/data/productLogos'

// Display-image fallback chain: uploaded logo (future API field) → bundled
// local logo by name → legacy remote image URL.
export const getProductImage = (product?: ProductType): string =>
    product?.logo ?? getProductLogo(product?.name) ?? product?.image ?? ''

interface ProductVisualProps {
    product?: ProductType;
    color?: string;
    logoPosition?: CartLogoPosition;
    isFlipped?: boolean;
}

function ProductVisual({ product, color, logoPosition, isFlipped }: ProductVisualProps): JSX.Element {
    const { Visual } = configFor(product)

    return (
        <Visual
            image={getProductImage(product)}
            color={color}
            logoPosition={logoPosition}
            isFlipped={isFlipped}
        />
    )
}

export default ProductVisual
