import { ComponentType } from 'react'
import TShirt from '@/components/TShirt'
import Mug from '@/components/Mug'
import Mousepad from '@/components/Mousepad'
import type { CartLogoPosition, ProductKind, ProductType } from '@/types/ProductType'

export interface VisualProps {
    image: string;
    color?: string;
    logoPosition?: CartLogoPosition;
    isFlipped?: boolean;
}

export type RequiredField = 'size' | 'logoPosition'

export interface TypeConfig {
    hasColors: boolean;
    hasSizes: boolean;
    hasLogoPosition: boolean;
    canFlip: boolean;
    required: RequiredField[];
    Visual: ComponentType<VisualProps>;
}

export const typeConfig: Record<ProductKind, TypeConfig> = {
    polo: {
        hasColors: true,
        hasSizes: true,
        hasLogoPosition: true,
        canFlip: true,
        required: ['size', 'logoPosition'],
        Visual: TShirt
    },
    taza: {
        hasColors: true,
        hasSizes: false,
        hasLogoPosition: false,
        canFlip: false,
        required: [],
        Visual: Mug
    },
    mousepad: {
        hasColors: true,
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
