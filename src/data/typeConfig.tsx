import { ComponentType } from 'react'
import TShirt from '@/components/TShirt'
import Mug from '@/components/Mug'
import Mousepad from '@/components/Mousepad'
import type { CartLogoPosition, Cut, ProductKind, ProductType } from '@/types/ProductType'

export interface VisualProps {
    image: string;
    color?: string;
    logoPosition?: CartLogoPosition;
    isFlipped?: boolean;
    /** Corte del polo (spec R4.6): `TShirt` elige el arte de `TSHIRT_ART[cut]`. */
    cut?: Cut;
}

export type RequiredField = 'cut' | 'size' | 'logoPosition'

export interface TypeConfig {
    hasColors: boolean;
    /** Cortes hombre/mujer (spec 04). Las tallas salen de `sizesFor(cut)`, no de `product.sizes`. */
    hasCuts: boolean;
    hasSizes: boolean;
    hasLogoPosition: boolean;
    canFlip: boolean;
    required: RequiredField[];
    Visual: ComponentType<VisualProps>;
}

export const typeConfig: Record<ProductKind, TypeConfig> = {
    polo: {
        hasColors: true,
        hasCuts: true,
        hasSizes: true,
        hasLogoPosition: true,
        canFlip: true,
        required: ['cut', 'size', 'logoPosition'],
        Visual: TShirt
    },
    taza: {
        hasColors: true,
        hasCuts: false,
        hasSizes: false,
        hasLogoPosition: false,
        canFlip: false,
        required: [],
        Visual: Mug
    },
    mousepad: {
        hasColors: true,
        hasCuts: false,
        hasSizes: false,
        hasLogoPosition: false,
        canFlip: false,
        required: [],
        Visual: Mousepad
    }
}

// Unknown or missing type always falls back to polo behavior (legacy Firestore
// docs have no `type` field yet).
export const configFor = (product?: ProductType): TypeConfig =>
    typeConfig[product?.type ?? 'polo'] ?? typeConfig.polo
