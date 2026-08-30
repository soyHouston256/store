import styled from 'styled-components'
import { isDarkHexColor } from '@/utils/color'

interface LogoImageProps {
    $darkSurface: boolean;
}

const MugWrapper = styled.picture`
    position: relative;
    width: 320px;
    display: flex;
    align-items: center;
    height: 100%;
    transition: opacity 0.3s ease-in-out;

    svg {
        width: 100%;
        height: auto;
        path, rect, ellipse {
            transition: all ease-in-out .2s;
        }
    }
    @media screen and (max-width: 1024px){
        width: 280px;
    }
    @media screen and (max-width: 768px){
        width: 200px;
    }
`

const LogoImage = styled.img<LogoImageProps>`
    position: absolute;
    z-index: 2;
    width: 23%;
    max-height: 30%;
    left: 44%;
    top: 49%;
    object-fit: contain;
    pointer-events: none;
    opacity: ${({ $darkSurface }) => $darkSurface ? 0.92 : 0.86};
    filter: ${({ $darkSurface }) => $darkSurface
        ? 'brightness(0) invert(1) drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2))'
        : 'drop-shadow(0 2px 1px rgba(0, 0, 0, 0.14))'};
    transform: translate(-50%, -50%);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
`

function Mug({ color, image }: { image: string, color?: string, logoPosition?: string, isFlipped?: boolean }) {
    const fillColor = color ?? '#FFFFFF'
    const darkSurface = isDarkHexColor(fillColor)

    return (
        <MugWrapper>
            {image && <LogoImage className='model' src={image} $darkSurface={darkSurface} />}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1000" fill="none">
                {/* handle */}
                <path d="M830 330 H920 C1030 330 1090 395 1090 490 C1090 585 1030 650 920 650 H830 V575 H915 C975 575 1010 540 1010 490 C1010 440 975 405 915 405 H830 Z" fill={fillColor} stroke="var(--color-border)" strokeWidth="8" />
                <path d="M905 415 C960 420 995 450 995 490 C995 530 960 560 905 565 C985 545 985 435 905 415 Z" fill="#000000" opacity="0.08" />
                {/* body */}
                <rect x="300" y="180" width="560" height="640" rx="70" fill={fillColor} stroke="var(--color-border)" strokeWidth="8" />
                {/* shading (fixed, semi-transparent black so depth reads on any color) */}
                <path d="M370 180 Q300 180 300 250 L300 750 Q300 820 370 820 L390 820 L390 180 Z" fill="#000000" opacity="0.07" />
                <path d="M770 180 L790 180 Q860 180 860 250 L860 750 Q860 820 790 820 L770 820 Z" fill="#000000" opacity="0.07" />
                <path d="M300 720 L300 750 Q300 820 370 820 L790 820 Q860 820 860 750 L860 720 Q580 790 300 720 Z" fill="#000000" opacity="0.08" />
                {/* rim */}
                <ellipse cx="580" cy="185" rx="285" ry="48" fill={fillColor} stroke="var(--color-border)" strokeWidth="8" />
                <ellipse cx="580" cy="185" rx="238" ry="32" fill="#000000" opacity="0.14" />
            </svg>
        </MugWrapper>
    )
}

export default Mug
