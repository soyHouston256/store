import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

// CTA de la ficha (spec R5.3 (7) / C13, canvas): 52 alto, acento, 16/700.
// Estados: "Agregar al carrito · S/ {precio×cantidad}" → tras agregar "Agregado ✓
// · Ir al carrito" (enlace a /cart, verde) durante 3 s o hasta cambiar la
// selección → con `soldOut` "Agotado" deshabilitado. Lo comparten el botón
// principal y la barra fija móvil (`StickyBuyBar`).
export type AddToCartState = 'idle' | 'added' | 'soldOut'

export const ADDED_FEEDBACK_MS = 3000

export const formatPrice = (amount: number): string => `S/ ${amount.toFixed(2)}`

const base = css<{ $compact?: boolean }>`
    flex-grow: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: ${({ $compact }) => $compact ? '48px' : '52px'};
    padding: 0 20px;
    border-radius: 26px;
    border: none;
    font-family: inherit;
    font-size: ${({ $compact }) => $compact ? '15px' : '16px'};
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
    text-decoration: none;
    box-sizing: border-box;
    cursor: pointer;
    transition: background .15s ease, transform .15s ease;
    &:focus-visible {
        outline: 2px solid var(--dh-ink);
        outline-offset: 2px;
    }
`
const Button = styled.button<{ $compact?: boolean }>`
    ${base}
    background: var(--dh-accent);
    color: #FFFFFF;
    &:hover:not(:disabled) {
        background: var(--dh-accent-hover);
    }
    &:disabled {
        background: var(--dh-line-2);
        color: var(--dh-muted);
        cursor: not-allowed;
    }
`
const AddedLink = styled(Link)<{ $compact?: boolean }>`
    ${base}
    background: var(--dh-green);
    color: #FFFFFF;
    &:hover {
        filter: brightness(.95);
    }
`

interface AddToCartButtonProps {
    state: AddToCartState
    /** Total mostrado en el estado `idle` (precio × cantidad). */
    total: number
    onAdd: () => void
    compact?: boolean
}

function AddToCartButton({ state, total, onAdd, compact }: AddToCartButtonProps): JSX.Element {
    if (state === 'added') {
        return <AddedLink to="/cart" $compact={compact} role="status">Agregado ✓ · Ir al carrito</AddedLink>
    }
    const soldOut = state === 'soldOut'
    return (
        <Button type="button" $compact={compact} onClick={onAdd} disabled={soldOut} aria-disabled={soldOut || undefined}>
            {soldOut ? 'Agotado' : `Agregar al carrito · ${formatPrice(total)}`}
        </Button>
    )
}

export default AddToCartButton
