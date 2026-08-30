import styled, { keyframes } from 'styled-components'
import IllustrationWrapper from './IllustrationWrapper'

const draw = keyframes`
    0% {
        stroke-dashoffset: 1;
        opacity: 0.4;
    }
    60%, 100% {
        stroke-dashoffset: 0;
        opacity: 1;
    }
`

const settle = keyframes`
    0% {
        transform: scale(0.85);
    }
    55% {
        transform: scale(1.08);
    }
    100% {
        transform: scale(1);
    }
`

const idleBreath = keyframes`
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.035);
    }
`

const CheckMark = styled.path`
    stroke-dasharray: 1;
    animation: ${draw} 0.9s ease-out forwards;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        stroke-dashoffset: 0;
        opacity: 1;
    }
`

const CheckGroup = styled.g`
    transform-origin: 80px 90px;
    animation:
        ${settle} 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both,
        ${idleBreath} 3.2s ease-in-out 0.7s infinite;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        transform: scale(1);
    }
`

function ConfirmadoIllustration(): JSX.Element {
    return (
        <IllustrationWrapper>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none" aria-hidden="true">
                {/* clipboard */}
                <rect x="42" y="28" width="76" height="104" rx="8" fill="var(--color-neutral, #FFF)" stroke="var(--color-border-solid, #ccc)" strokeWidth="3" />
                <rect x="64" y="20" width="32" height="16" rx="5" fill="var(--color-border-solid, #ccc)" />
                <rect x="54" y="60" width="30" height="6" rx="3" fill="var(--color-border-solid, #ccc)" opacity="0.6" />
                <rect x="54" y="118" width="24" height="6" rx="3" fill="var(--color-border-solid, #ccc)" opacity="0.6" />

                {/* confirmed check, drawn on then settled */}
                <CheckGroup>
                    <circle cx="80" cy="90" r="30" fill="var(--color-accent-light, #FCF7F4)" />
                    <CheckMark
                        d="M65 90 L76 101 L98 78"
                        pathLength={1}
                        stroke="var(--color-accent, #FF6565)"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </CheckGroup>
            </svg>
        </IllustrationWrapper>
    )
}

export default ConfirmadoIllustration
