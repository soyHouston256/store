import styled, { keyframes } from 'styled-components'
import IllustrationWrapper from './IllustrationWrapper'

const stitch = keyframes`
    0%, 48%, 100% {
        transform: translateY(0px);
    }
    8%, 24%, 40% {
        transform: translateY(11px);
    }
    16%, 32% {
        transform: translateY(0px);
    }
`

const threadFeed = keyframes`
    from {
        stroke-dashoffset: 14;
    }
    to {
        stroke-dashoffset: 0;
    }
`

const Needle = styled.g`
    animation: ${stitch} 2.4s ease-in-out infinite;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        transform: translateY(0px);
    }
`

const Thread = styled.path`
    stroke-dasharray: 4 3;
    animation: ${threadFeed} 1.2s linear infinite;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        stroke-dashoffset: 0;
    }
`

function PreparadoIllustration(): JSX.Element {
    return (
        <IllustrationWrapper>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none" aria-hidden="true">
                {/* bed / table */}
                <rect x="22" y="106" width="116" height="12" rx="5" fill="var(--color-border-solid, #ccc)" opacity="0.5" />

                {/* fabric being stitched */}
                <rect x="30" y="92" width="56" height="16" rx="3" fill="var(--color-accent-light, #FCF7F4)" stroke="var(--color-border-solid, #ccc)" strokeWidth="2" />
                <path d="M40 92 L40 108 M52 92 L52 108 M64 92 L64 108" stroke="var(--color-border-solid, #ccc)" strokeWidth="1.5" opacity="0.5" />

                {/* machine body */}
                <rect x="88" y="46" width="44" height="62" rx="14" fill="var(--color-accent, #FF6565)" />
                <circle cx="122" cy="60" r="5" fill="var(--color-neutral, #FFF)" opacity="0.6" />
                <path d="M96 46 C70 44 56 50 56 64 L56 72" stroke="var(--color-accent, #FF6565)" strokeWidth="13" strokeLinecap="round" fill="none" />

                {/* spool + thread */}
                <circle cx="56" cy="34" r="7" fill="var(--color-neutral, #FFF)" stroke="var(--color-border-solid, #ccc)" strokeWidth="2.5" />
                <line x1="56" y1="30" x2="56" y2="38" stroke="var(--color-border-solid, #ccc)" strokeWidth="2" />
                <Thread d="M56 41 L56 58 L58 70 L58 80" stroke="var(--color-text, #000)" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />

                {/* head + needle */}
                <rect x="49" y="70" width="18" height="14" rx="4" fill="var(--color-accent, #FF6565)" />
                <Needle>
                    <rect x="56" y="82" width="4" height="22" rx="2" fill="var(--color-text, #000)" opacity="0.75" />
                </Needle>
            </svg>
        </IllustrationWrapper>
    )
}

export default PreparadoIllustration
