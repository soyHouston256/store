import styled, { keyframes } from 'styled-components'
import IllustrationWrapper from './IllustrationWrapper'

const settle = keyframes`
    0% {
        opacity: 0;
        transform: translateY(10px) scale(0.85);
    }
    65% {
        opacity: 1;
        transform: translateY(-3px) scale(1.04);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
`

const bowPop = keyframes`
    0% {
        opacity: 0;
        transform: scale(0.4);
    }
    70% {
        opacity: 1;
        transform: scale(1.15);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
`

const twinkle = keyframes`
    0% {
        opacity: 0;
        transform: translateY(6px) scale(0.6);
    }
    35% {
        opacity: 0.85;
    }
    70% {
        opacity: 0.35;
    }
    100% {
        opacity: 0;
        transform: translateY(-14px) scale(1);
    }
`

const GiftGroup = styled.g`
    transform-origin: 80px 100px;
    animation: ${settle} 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        opacity: 1;
        transform: none;
    }
`

const Bow = styled.g`
    transform-origin: 80px 60px;
    animation: ${bowPop} 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.55s both;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        opacity: 1;
        transform: none;
    }
`

const Sparkle = styled.path`
    animation: ${twinkle} 3.6s ease-in-out infinite;

    &.sparkle_2 {
        animation-delay: 1.2s;
    }
    &.sparkle_3 {
        animation-delay: 2.4s;
    }

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        opacity: 0.45;
        transform: none;
    }
`

/** Four-pointed sparkle centered at (cx, cy) with radius r. */
const sparklePath = (cx: number, cy: number, r: number): string => {
    const w = r * 0.24
    return `M ${cx} ${cy - r} `
        + `Q ${cx + w} ${cy - w} ${cx + r} ${cy} `
        + `Q ${cx + w} ${cy + w} ${cx} ${cy + r} `
        + `Q ${cx - w} ${cy + w} ${cx - r} ${cy} `
        + `Q ${cx - w} ${cy - w} ${cx} ${cy - r} Z`
}

function FinalizadoIllustration(): JSX.Element {
    return (
        <IllustrationWrapper>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none" aria-hidden="true">
                <GiftGroup>
                    {/* soft ground shadow */}
                    <ellipse cx="80" cy="136" rx="42" ry="5" fill="var(--color-border-solid, #ccc)" opacity="0.3" />

                    {/* box body */}
                    <rect x="46" y="82" width="68" height="50" rx="6" fill="var(--color-neutral, #FFF)" stroke="var(--color-border-solid, #ccc)" strokeWidth="3" />
                    <rect x="46" y="82" width="68" height="50" rx="6" fill="var(--color-accent, #FF6565)" opacity="0.05" />

                    {/* lid */}
                    <rect x="39" y="64" width="82" height="18" rx="5" fill="var(--color-background, #FCF7F4)" stroke="var(--color-border-solid, #ccc)" strokeWidth="3" />

                    {/* vertical ribbon over lid + body */}
                    <rect x="73" y="64" width="14" height="18" fill="var(--color-accent, #FF6565)" />
                    <rect x="73" y="82" width="14" height="50" fill="var(--color-accent, #FF6565)" opacity="0.85" />

                    {/* bow: two loops and a knot */}
                    <Bow>
                        <path d="M 78 60 C 70 46 52 48 59 59 C 62 64 72 64 78 60 Z" fill="var(--color-accent, #FF6565)" />
                        <path d="M 82 60 C 90 46 108 48 101 59 C 98 64 88 64 82 60 Z" fill="var(--color-accent, #FF6565)" />
                        <circle cx="80" cy="60" r="5" fill="var(--color-accent, #FF6565)" stroke="var(--color-neutral, #FFF)" strokeWidth="1.5" />
                    </Bow>
                </GiftGroup>

                {/* ambient sparkles, gently rising */}
                <Sparkle className="sparkle_1" d={sparklePath(38, 62, 6)} fill="var(--color-accent, #FF6565)" />
                <Sparkle className="sparkle_2" d={sparklePath(124, 52, 5)} fill="var(--color-accent, #FF6565)" opacity="0.9" />
                <Sparkle className="sparkle_3" d={sparklePath(118, 100, 4)} fill="var(--color-accent, #FF6565)" opacity="0.8" />
            </svg>
        </IllustrationWrapper>
    )
}

export default FinalizadoIllustration
