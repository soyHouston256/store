import { useEffect, useState } from "react"
import styled from "styled-components"
import Lottie from 'react-lottie-player'
import lottieJson from '@/assets/animations/bounce.json'
import likeSound from '@/assets/like.mp3'

// Favorito 44×44 (spec R3.6 / canvas): círculo sobre la imagen, arriba-der.
// Sonido `like.mp3` + Lottie `bounce.json` intactos (spec R0.2).
const LikeWrapper = styled.button`
    background-color: var(--dh-surface);
    border: none;
    border-radius: 22px;
    width: 44px;
    height: 44px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: absolute;
    right: 12px;
    top: 12px;
    z-index: 3;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .06);
    &:focus-visible {
        outline: 2px solid var(--dh-ink);
        outline-offset: 2px;
    }
    & > svg {
        width: 20px;
        height: 20px;
        fill: var(--dh-line-2);
        position: relative;
        transition: all .2s ease-in;
        &.animating {
            transition: all .2s .3s ease-in;
            fill: var(--color-accent);
        }
        &.icon_liked {
            fill: var(--color-accent);
        }
    }
    .icon_sparkle {
        position: absolute;
        right: -14px;
        top: -19px;
    }
`

function LikeButton({ liked, status }: { liked: any, status: boolean }): JSX.Element {
    const [like, setLike] = useState(false)
    const [animating, setAnimating] = useState(false)
    const triggerLike = () => { 
        setLike(!like)
        if (!like) {
            setAnimating(true)
            playLikeSound()
        }
        liked()
    }

    const audio = new Audio(likeSound)

	const playLikeSound = () => {
		audio.playbackRate = 2
        audio.volume = .5
		audio.play()
	};

    useEffect(() => {
        setLike(status)
    }, [status])

    return (
        <LikeWrapper type="button" onClick={triggerLike} aria-pressed={like} aria-label={like ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
            {like && !animating ? 
                <svg className="icon_liked" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256"><path d="M236 92c0 30.6-17.7 62-52.6 93.4a314.3 314.3 0 0 1-51.5 37.6a8.1 8.1 0 0 1-7.8 0C119.8 220.6 20 163.9 20 92a60 60 0 0 1 108-36a60 60 0 0 1 108 36Z"></path></svg>
                : <svg className={animating ? 'animating' : ''} preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256"><path d="M236 92c0 30.6-17.7 62-52.6 93.4a314.3 314.3 0 0 1-51.5 37.6a8.1 8.1 0 0 1-7.8 0C119.8 220.6 20 163.9 20 92a60 60 0 0 1 108-36a60 60 0 0 1 108 36Z"></path></svg>
            }
            {animating &&
                <Lottie
                    className="icon_sparkle"
                    loop={false}
                    animationData={lottieJson}
                    play={animating}
                    speed={1}
                    
                    style={{ width: 64, height: 64 }}
                    rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
                    onComplete={() => setAnimating(false)}
                />
            }
        </LikeWrapper>
    )
}

export default LikeButton