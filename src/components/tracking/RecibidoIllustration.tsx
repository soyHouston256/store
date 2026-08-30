import styled, { keyframes } from 'styled-components'
import IllustrationWrapper from './IllustrationWrapper'

const openLeft = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(-125deg);
    }
`

const openRight = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(125deg);
    }
`

const popIn = keyframes`
    0% {
        opacity: 0;
        transform: scale(0.5);
    }
    70% {
        opacity: 1;
        transform: scale(1.12);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
`

const LeftFlap = styled.rect`
    transform-origin: 40px 80px;
    animation: ${openLeft} 0.55s cubic-bezier(0.22, 0.61, 0.36, 1) 0.15s both;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        transform: rotate(-125deg);
    }
`

const RightFlap = styled.rect`
    transform-origin: 120px 80px;
    animation: ${openRight} 0.55s cubic-bezier(0.22, 0.61, 0.36, 1) 0.15s both;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        transform: rotate(125deg);
    }
`

const CheckBadge = styled.g`
    transform-origin: 80px 100px;
    animation: ${popIn} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.65s both;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        opacity: 1;
        transform: scale(1);
    }
`

function RecibidoIllustration(): JSX.Element {
    return (
        <IllustrationWrapper>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none" aria-hidden="true">
                {/* box body / opening */}
                <rect x="40" y="80" width="80" height="48" rx="6" fill="var(--color-neutral, #FFF)" stroke="var(--color-border-solid, #ccc)" strokeWidth="3" />
                <rect x="40" y="80" width="80" height="48" rx="6" fill="var(--color-accent, #FF6565)" opacity="0.06" />
                <line x1="46" y1="96" x2="114" y2="96" stroke="var(--color-border-solid, #ccc)" strokeWidth="1.5" opacity="0.4" />

                {/* open flaps, hinged at the box's top corners */}
                <LeftFlap x="40" y="75" width="40" height="10" rx="4" fill="var(--color-accent, #FF6565)" />
                <RightFlap x="80" y="75" width="40" height="10" rx="4" fill="var(--color-accent, #FF6565)" />

                {/* delivered confirmation */}
                <CheckBadge>
                    <circle cx="80" cy="100" r="19" fill="var(--color-accent, #FF6565)" />
                    <path d="M71 100 L78 107 L91 92" stroke="var(--color-neutral, #FFF)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </CheckBadge>
            </svg>
        </IllustrationWrapper>
    )
}

export default RecibidoIllustration
