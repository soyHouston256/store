import styled, { keyframes } from 'styled-components'
import IllustrationWrapper from './IllustrationWrapper'

const coinDrop = keyframes`
    0% {
        transform: translateY(-58px);
        opacity: 0;
    }
    18% {
        opacity: 1;
    }
    55% {
        transform: translateY(0px);
        opacity: 1;
    }
    68%, 100% {
        transform: translateY(6px);
        opacity: 0;
    }
`

const Coin = styled.g`
    animation: ${coinDrop} 2.8s ease-in infinite;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        transform: translateY(0px);
        opacity: 1;
    }
`

function PagadoIllustration(): JSX.Element {
    return (
        <IllustrationWrapper>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none" aria-hidden="true">
                {/* till / payment slot */}
                <rect x="30" y="86" width="100" height="54" rx="10" fill="var(--color-neutral, #FFF)" stroke="var(--color-border-solid, #ccc)" strokeWidth="3" />
                <rect x="30" y="86" width="100" height="18" rx="9" fill="var(--color-accent, #FF6565)" opacity="0.12" />
                <rect x="60" y="80" width="40" height="10" rx="5" fill="var(--color-border-solid, #ccc)" />
                <rect x="46" y="112" width="24" height="6" rx="3" fill="var(--color-border-solid, #ccc)" opacity="0.6" />
                <rect x="46" y="124" width="34" height="6" rx="3" fill="var(--color-border-solid, #ccc)" opacity="0.6" />

                {/* coin sliding into the slot */}
                <Coin>
                    <circle cx="80" cy="94" r="17" fill="var(--color-accent, #FF6565)" />
                    <circle cx="80" cy="94" r="17" fill="none" stroke="var(--color-neutral, #FFF)" strokeWidth="2" opacity="0.5" />
                    <text x="80" y="100" fontSize="15" fontWeight="700" textAnchor="middle" fill="var(--color-neutral, #FFF)">S/</text>
                </Coin>
            </svg>
        </IllustrationWrapper>
    )
}

export default PagadoIllustration
