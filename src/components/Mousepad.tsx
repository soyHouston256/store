import styled from 'styled-components'
import { isDarkHexColor } from '@/utils/color'

interface LogoImageProps {
    $darkSurface: boolean;
}

const MousepadWrapper = styled.picture`
    position: relative;
    width: 390px;
    max-width: 100%;
    display: flex;
    align-items: center;
    height: 100%;
    transition: opacity 0.3s ease-in-out;

    svg {
        width: 100%;
        height: auto;
        path {
            transition: all ease-in-out .2s;
        }
    }
    @media screen and (max-width: 1024px){
        width: 320px;
    }
    @media screen and (max-width: 768px){
        width: 240px;
    }
`

const LogoImage = styled.img<LogoImageProps>`
    position: absolute;
    z-index: 2;
    width: 24%;
    max-height: 26%;
    left: 50%;
    top: 51%;
    object-fit: contain;
    pointer-events: none;
    opacity: ${({ $darkSurface }) => $darkSurface ? 0.9 : 0.82};
    transform: translate(-50%, -50%) rotate(-1deg) scaleY(0.58);
    transform-origin: center;
    filter: ${({ $darkSurface }) => $darkSurface
        ? 'brightness(0) invert(1) drop-shadow(0 2px 2px rgba(0, 0, 0, 0.22))'
        : 'drop-shadow(0 2px 1px rgba(0, 0, 0, 0.16))'};
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
`

function Mousepad({ color, image }: { image: string, color?: string, logoPosition?: string, isFlipped?: boolean }) {
    const fillColor = color ?? '#FFFFFF'
    const darkSurface = isDarkHexColor(fillColor)

    return (
        <MousepadWrapper>
            {image && <LogoImage className='model' src={image} $darkSurface={darkSurface} />}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" fill="none">
                {/* base thickness edge */}
                <g transform="translate(0 16)">
                    <path d="M210 140 H990 Q1032 140 1040 180 L1106 516 Q1114 560 1070 560 H130 Q86 560 94 516 L160 180 Q168 140 210 140 Z" fill="#000000" opacity="0.25" />
                </g>
                {/* surface (rounded rect with slight perspective) */}
                <path d="M210 140 H990 Q1032 140 1040 180 L1106 516 Q1114 560 1070 560 H130 Q86 560 94 516 L160 180 Q168 140 210 140 Z" fill={fillColor} stroke="var(--color-border)" strokeWidth="8" />
                {/* shading (fixed, semi-transparent black so depth reads on any color) */}
                <path d="M700 140 H990 Q1032 140 1040 180 L1106 516 Q1114 560 1070 560 H840 Z" fill="#000000" opacity="0.05" />
                <path d="M94 516 Q86 560 130 560 H1070 Q1114 560 1106 516 L1102 496 Q600 560 98 496 Z" fill="#000000" opacity="0.08" />
                {/* stitched border */}
                <path d="M228 168 H972 Q1006 168 1013 202 L1074 508 Q1080 532 1050 532 H150 Q120 532 126 508 L187 202 Q194 168 228 168 Z" stroke="#000000" strokeOpacity="0.15" strokeWidth="5" strokeDasharray="14 10" />
            </svg>
        </MousepadWrapper>
    )
}

export default Mousepad
