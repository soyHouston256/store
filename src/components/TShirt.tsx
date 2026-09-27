import { normalizeLogoPosition } from '@/data/logoPositions'
import { LogoPlacement, TShirtArt, tshirtArtFor } from '@/data/tshirtArt'
import type { CartLogoPosition, Cut, LogoPosition } from '@/types/ProductType'
import { useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'

interface LogoImageProps {
    $placement: LogoPlacement;
}

interface TShirtWrapperProps {
    $isFlipped?: boolean;
}

interface TShirtStageProps {
    $animate: boolean;
    $isFlipped?: boolean;
}

const flipToBack = keyframes`
    0% {
        transform: rotateY(0deg) scale(1);
        opacity: 1;
    }
    46% {
        transform: rotateY(86deg) scale(0.96);
        opacity: 0.92;
    }
    54% {
        transform: rotateY(-86deg) scale(0.96);
        opacity: 0.92;
    }
    100% {
        transform: rotateY(0deg) scale(1);
        opacity: 1;
    }
`

const flipToFront = keyframes`
    0% {
        transform: rotateY(0deg) scale(1);
        opacity: 1;
    }
    46% {
        transform: rotateY(-86deg) scale(0.96);
        opacity: 0.92;
    }
    54% {
        transform: rotateY(86deg) scale(0.96);
        opacity: 0.92;
    }
    100% {
        transform: rotateY(0deg) scale(1);
        opacity: 1;
    }
`

const TShirtWrapper = styled.picture<TShirtWrapperProps>`
    position: relative;
    width: 320px;
    display: flex;
    align-items: center;
    height: 100%;
    perspective: 900px;
    transition: opacity 0.3s ease-in-out;

    svg {
        width: 100%;
        height: auto;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        mix-blend-mode: multiply;
        z-index: 1;
        path {
            transition: all ease-in-out .2s;
            stroke-width: 4px;
        }
    }
    img {
        &.base {
            width: 100%;
            image-rendering: -moz-crisp-edges;
            image-rendering: -o-crisp-edges;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
            -ms-interpolation-mode: nearest-neighbor;
        }
        &.filter {
            width: 100%;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 3;
            mix-blend-mode: overlay;
            opacity: 0.15;
            filter: blur(.01rem);
            image-rendering: -moz-crisp-edges;
            image-rendering: -o-crisp-edges;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
            -ms-interpolation-mode: nearest-neighbor;
        }
    }
    @media screen and (max-width: 1024px){
        width: 280px;
    }
    @media screen and (max-width: 768px){
        width: 200px;
    }
`

const TShirtStage = styled.div<TShirtStageProps>`
    position: relative;
    width: 100%;
    transform-style: preserve-3d;
    will-change: ${({ $animate }) => $animate ? 'transform, opacity' : 'auto'};
    animation: ${({ $animate, $isFlipped }) => $animate ? ($isFlipped ? flipToBack : flipToFront) : 'none'} 0.68s cubic-bezier(0.22, 0.61, 0.36, 1);

    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }
`

const LogoImage = styled.img<LogoImageProps>`
    position: absolute;
    z-index: 2;
    object-fit: contain;
    pointer-events: none;
    filter: drop-shadow(0 3px 2px rgba(0, 0, 0, 0.12));
    transform-origin: center;
    will-change: left, top, width, transform, opacity;
    transition:
        left 0.46s cubic-bezier(0.22, 0.61, 0.36, 1),
        top 0.46s cubic-bezier(0.22, 0.61, 0.36, 1),
        width 0.46s cubic-bezier(0.22, 0.61, 0.36, 1),
        transform 0.46s cubic-bezier(0.22, 0.61, 0.36, 1),
        opacity 0.28s ease;

    width: ${({ $placement }) => $placement.width};
    left: ${({ $placement }) => $placement.left};
    top: ${({ $placement }) => $placement.top};
    transform: translate(-50%, -50%) scale(1);

    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }
`

interface TShirtProps {
    color?: string
    image: string
    logoPosition?: CartLogoPosition
    isFlipped?: boolean
    /** Corte (spec R4.6 / design §8.4): elige el arte de `TSHIRT_ART`; sin corte → hombre. */
    cut?: Cut
}

/** Posición del logo en la vista actual (frente/espalda) según el arte del corte. */
const placementFor = (art: TShirtArt, position: LogoPosition | undefined, isBack: boolean): LogoPlacement => {
    if (isBack) return art.backPlacement
    return position ? art.placement[position] : art.placement.chest
}

function TShirt({color, image, logoPosition, isFlipped, cut}: TShirtProps) {
    const fillColor = color ?? '#FFFFFF'
    const flipped = Boolean(isFlipped)
    const art = tshirtArtFor(cut)
    const normalizedLogoPosition = normalizeLogoPosition(logoPosition)
    const shouldShowLogo = Boolean(image) && (
        flipped
            ? normalizedLogoPosition === 'back' || normalizedLogoPosition === 'front-back'
            : normalizedLogoPosition !== 'back'
    )
    const [animateFlip, setAnimateFlip] = useState(false)
    const previousFlipped = useRef(flipped)

    useEffect(() => {
        if (previousFlipped.current === flipped) return

        previousFlipped.current = flipped
        setAnimateFlip(true)
        const timeoutId = setTimeout(() => setAnimateFlip(false), 720)

        return () => clearTimeout(timeoutId)
    }, [flipped])

    return (
        <TShirtWrapper $isFlipped={flipped}>
            <TShirtStage $animate={animateFlip} $isFlipped={flipped}>
                {shouldShowLogo && <LogoImage className='model' src={image} $placement={placementFor(art, normalizedLogoPosition, flipped)} />}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox={art.viewBox} fill="none" data-cut={cut ?? 'hombre'} data-placeholder={art.isPlaceholder ? 'true' : undefined}>
                    <path stroke={fillColor} fillRule="evenodd" clipRule="evenodd" d={art.path} fill={fillColor} />
                </svg>
                <img className='base' src={flipped ? art.back.base : art.front.base} alt="" />
                <img className='filter' src={flipped ? art.back.filter : art.front.filter} alt="" />
            </TShirtStage>
        </TShirtWrapper>
    )
}

export default TShirt
