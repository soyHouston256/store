import styled, { keyframes } from 'styled-components'
import IllustrationWrapper from './IllustrationWrapper'

const pulse = keyframes`
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.08);
    }
`

const tick = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`

const ClockGroup = styled.g`
    transform-origin: 112px 116px;
    animation: ${pulse} 2.6s ease-in-out infinite;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        transform: scale(1.04);
    }
`

const MinuteHand = styled.line`
    transform-origin: 112px 116px;
    animation: ${tick} 6s linear infinite;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        transform: rotate(120deg);
    }
`

function PendienteIllustration(): JSX.Element {
    return (
        <IllustrationWrapper>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none" aria-hidden="true">
                {/* order note */}
                <rect x="26" y="34" width="78" height="98" rx="8" fill="var(--color-neutral, #FFF)" stroke="var(--color-border-solid, #ccc)" strokeWidth="3" />
                <path d="M84 34 L104 34 L104 54 Z" fill="var(--color-background, #FCF7F4)" stroke="var(--color-border-solid, #ccc)" strokeWidth="3" strokeLinejoin="round" />
                <rect x="38" y="58" width="42" height="6" rx="3" fill="var(--color-border-solid, #ccc)" opacity="0.7" />
                <rect x="38" y="72" width="54" height="6" rx="3" fill="var(--color-border-solid, #ccc)" opacity="0.7" />
                <rect x="38" y="86" width="34" height="6" rx="3" fill="var(--color-border-solid, #ccc)" opacity="0.7" />
                <rect x="38" y="106" width="30" height="8" rx="4" fill="var(--color-accent, #FF6565)" opacity="0.18" />

                {/* pulsing clock badge */}
                <ClockGroup>
                    <circle cx="112" cy="116" r="28" fill="var(--color-background, #FCF7F4)" stroke="var(--color-accent, #FF6565)" strokeWidth="4" />
                    <MinuteHand x1="112" y1="116" x2="112" y2="100" stroke="var(--color-accent, #FF6565)" strokeWidth="3" strokeLinecap="round" />
                    <line x1="112" y1="116" x2="123" y2="116" stroke="var(--color-accent, #FF6565)" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="112" cy="116" r="3" fill="var(--color-accent, #FF6565)" />
                </ClockGroup>
            </svg>
        </IllustrationWrapper>
    )
}

export default PendienteIllustration
