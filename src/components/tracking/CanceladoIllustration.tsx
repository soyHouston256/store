import styled, { keyframes } from 'styled-components'
import IllustrationWrapper from './IllustrationWrapper'

const softFade = keyframes`
    0%, 100% {
        opacity: 0.86;
    }
    50% {
        opacity: 1;
    }
`

const Muted = styled.g`
    animation: ${softFade} 4.4s ease-in-out infinite;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        opacity: 1;
    }
`

function CanceladoIllustration(): JSX.Element {
    return (
        <IllustrationWrapper>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none" aria-hidden="true">
                <Muted>
                    {/* closed, desaturated box */}
                    <rect x="40" y="60" width="80" height="60" rx="6" fill="var(--color-neutral, #FFF)" stroke="var(--color-border-solid, #ccc)" strokeWidth="3" opacity="0.9" />
                    <rect x="40" y="60" width="80" height="60" rx="6" fill="var(--color-border-solid, #ccc)" opacity="0.18" />
                    <line x1="80" y1="60" x2="80" y2="120" stroke="var(--color-border-solid, #ccc)" strokeWidth="1.5" opacity="0.4" />
                    <path d="M40 60 L80 76 L120 60" stroke="var(--color-border-solid, #ccc)" strokeWidth="2" opacity="0.4" fill="none" />

                    {/* soft, muted x */}
                    <path
                        d="M66 86 L94 114 M94 86 L66 114"
                        stroke="var(--color-text, #000)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        opacity="0.32"
                    />
                </Muted>
            </svg>
        </IllustrationWrapper>
    )
}

export default CanceladoIllustration
