import type { CartLogoPosition, LogoPosition, ProductType } from '@/types/ProductType'

export const DEFAULT_LOGO_POSITIONS: LogoPosition[] = ['pocket', 'chest', 'back', 'front-back']

export const LOGO_POSITION_OPTIONS: Record<LogoPosition, { label: string; title: string }> = {
    pocket: {
        label: 'Bolsillo delantero',
        title: 'Logo pequeño en el bolsillo delantero'
    },
    chest: {
        label: 'Pecho',
        title: 'Logo grande centrado en el pecho'
    },
    back: {
        label: 'Espalda',
        title: 'Logo grande solo en la espalda'
    },
    'front-back': {
        label: 'Bolsillo + espalda',
        title: 'Logo pequeño delante y grande en la espalda'
    }
}

const logoPositionSet = new Set<string>(DEFAULT_LOGO_POSITIONS)

export const normalizeLogoPosition = (position?: CartLogoPosition | string): LogoPosition | undefined => {
    if (position === 'back-chest') return 'front-back'
    return position && logoPositionSet.has(position) ? position as LogoPosition : undefined
}

export const isBackLogoPosition = (position?: CartLogoPosition | string): boolean => {
    const normalized = normalizeLogoPosition(position)
    return normalized === 'back' || normalized === 'front-back'
}

export const logoPositionsFor = (product?: ProductType): LogoPosition[] => {
    if ((product?.type ?? 'polo') !== 'polo') return []
    const configured = (product?.logoPositions ?? [])
        .map(normalizeLogoPosition)
        .filter((position): position is LogoPosition => Boolean(position))

    return configured.length ? [...new Set(configured)] : DEFAULT_LOGO_POSITIONS
}
