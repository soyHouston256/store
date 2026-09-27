import styled from 'styled-components'

// "Ver espalda" / "Ver frente" (spec R0.2), extraído del modal. Se muestra sobre
// la imagen principal solo cuando la posición del logo es trasera; la ficha
// también lo sincroniza con las miniaturas Frente/Espalda (spec R5.2).
const Button = styled.button`
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    height: 40px;
    padding: 0 18px;
    border-radius: 20px;
    border: 1px solid var(--dh-line-2);
    background: var(--dh-surface);
    color: var(--dh-ink);
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    z-index: 4;
    white-space: nowrap;
    transition: border-color .15s ease, background .15s ease;
    &:hover {
        border-color: var(--dh-ink);
    }
    &:focus-visible {
        outline: 2px solid var(--dh-ink);
        outline-offset: 2px;
    }
`

interface FlipButtonProps {
    isFlipped: boolean
    onToggle: () => void
}

function FlipButton({ isFlipped, onToggle }: FlipButtonProps): JSX.Element {
    return (
        <Button type="button" onClick={onToggle} aria-pressed={isFlipped}>
            {isFlipped ? 'Ver frente' : 'Ver espalda'}
        </Button>
    )
}

export default FlipButton
