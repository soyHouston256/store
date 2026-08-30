import styled, { keyframes } from 'styled-components'
import IllustrationWrapper from './IllustrationWrapper'

const bob = keyframes`
    0%, 100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-3px);
    }
`

const roll = keyframes`
    from {
        stroke-dashoffset: 24;
    }
    to {
        stroke-dashoffset: 0;
    }
`

const windLine = keyframes`
    0% {
        transform: translateX(6px);
        opacity: 0;
    }
    35% {
        opacity: 0.6;
    }
    100% {
        transform: translateX(-14px);
        opacity: 0;
    }
`

const ScooterGroup = styled.g`
    animation: ${bob} 2.6s ease-in-out infinite;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }
`

const RoadLine = styled.line`
    stroke-dasharray: 8 6;
    animation: ${roll} 1.4s linear infinite;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }
`

const WindLine = styled.line`
    animation: ${windLine} 2.2s ease-out infinite;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        opacity: 0.35;
        transform: translateX(0px);
    }
`

function EnviadoIllustration(): JSX.Element {
    return (
        <IllustrationWrapper>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none" aria-hidden="true">
                {/* road */}
                <RoadLine x1="18" y1="126" x2="142" y2="126" stroke="var(--color-border-solid, #ccc)" strokeWidth="3" strokeLinecap="round" />

                <ScooterGroup>
                    {/* wind / speed lines */}
                    <WindLine x1="18" y1="82" x2="38" y2="82" stroke="var(--color-border-solid, #ccc)" strokeWidth="3" strokeLinecap="round" />
                    <WindLine x1="22" y1="94" x2="36" y2="94" stroke="var(--color-border-solid, #ccc)" strokeWidth="3" strokeLinecap="round" style={{ animationDelay: '0.5s' }} />

                    {/* delivery box */}
                    <rect x="98" y="56" width="28" height="26" rx="5" fill="var(--color-neutral, #FFF)" stroke="var(--color-accent, #FF6565)" strokeWidth="3" />
                    <path d="M98 69 L126 69" stroke="var(--color-accent, #FF6565)" strokeWidth="2" opacity="0.5" />

                    {/* frame */}
                    <line x1="98" y1="94" x2="98" y2="76" stroke="var(--color-accent, #FF6565)" strokeWidth="6" strokeLinecap="round" />
                    <line x1="60" y1="94" x2="106" y2="94" stroke="var(--color-accent, #FF6565)" strokeWidth="7" strokeLinecap="round" />
                    <line x1="58" y1="94" x2="46" y2="64" stroke="var(--color-accent, #FF6565)" strokeWidth="6" strokeLinecap="round" />
                    <line x1="38" y1="62" x2="56" y2="62" stroke="var(--color-accent, #FF6565)" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="38" cy="68" r="3.5" fill="var(--color-accent, #FF6565)" />

                    {/* seat */}
                    <rect x="88" y="72" width="18" height="7" rx="3.5" fill="var(--color-accent, #FF6565)" />

                    {/* wheels */}
                    <circle cx="54" cy="112" r="12" fill="var(--color-text, #000)" opacity="0.82" />
                    <circle cx="54" cy="112" r="4" fill="var(--color-neutral, #FFF)" />
                    <circle cx="104" cy="112" r="12" fill="var(--color-text, #000)" opacity="0.82" />
                    <circle cx="104" cy="112" r="4" fill="var(--color-neutral, #FFF)" />
                </ScooterGroup>
            </svg>
        </IllustrationWrapper>
    )
}

export default EnviadoIllustration
