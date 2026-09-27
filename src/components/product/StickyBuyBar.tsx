import styled from 'styled-components'
import AddToCartButton, { AddToCartState, formatPrice } from '@/components/product/AddToCartButton'

// Barra fija inferior ≤640 (spec R5.6 / design §8.3): precio + "Agregar al
// carrito" con el MISMO estado que el botón principal. La página añade
// `padding-bottom` (`STICKY_BAR_HEIGHT`) para no tapar contenido.
export const STICKY_BAR_HEIGHT = 72

const Bar = styled.div`
    display: none;
    @media screen and (max-width: 640px) {
        display: flex;
        align-items: center;
        gap: 12px;
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 15;
        min-height: ${STICKY_BAR_HEIGHT}px;
        padding: 12px 16px;
        padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
        box-sizing: border-box;
        background: var(--dh-surface);
        border-top: 1px solid var(--dh-line);
        box-shadow: 0 -8px 24px rgba(0, 0, 0, .06);
        .sticky_price {
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            small {
                font-size: 11px;
                color: var(--dh-muted);
            }
            b {
                font-family: var(--dh-font-display);
                font-size: 20px;
                font-weight: 700;
                color: var(--dh-ink);
                line-height: 1.1;
            }
        }
    }
`

interface StickyBuyBarProps {
    unitPrice: number
    quantity: number
    state: AddToCartState
    onAdd: () => void
}

function StickyBuyBar({ unitPrice, quantity, state, onAdd }: StickyBuyBarProps): JSX.Element {
    const total = unitPrice * quantity
    return (
        <Bar aria-label="Comprar">
            <div className="sticky_price">
                <small>{quantity > 1 ? `${quantity} × ${formatPrice(unitPrice)}` : 'IGV incluido'}</small>
                <b>{formatPrice(total)}</b>
            </div>
            <AddToCartButton state={state} total={total} onAdd={onAdd} compact />
        </Bar>
    )
}

export default StickyBuyBar
