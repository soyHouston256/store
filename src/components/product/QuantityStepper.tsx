import styled from 'styled-components'
import { MAX_CART_QUANTITY } from '@/store/slices/products/cart'

// Stepper de cantidad 1–10 (spec R5.3 (7), canvas): pastilla 52 alto con borde
// --dh-line-2, botones 48 "−"/"+" (`−` deshabilitado en 1, `+` en 10).
const Stepper = styled.div`
    display: inline-flex;
    align-items: center;
    height: 52px;
    border-radius: 26px;
    border: 1.5px solid var(--dh-line-2);
    background: var(--dh-surface);
    box-sizing: border-box;
    flex-shrink: 0;
    button {
        width: 48px;
        height: 48px;
        border: none;
        background: transparent;
        color: var(--dh-ink);
        font-family: inherit;
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
        border-radius: 24px;
        &:disabled {
            color: var(--dh-line-2);
            cursor: not-allowed;
        }
        &:focus-visible {
            outline: 2px solid var(--dh-ink);
            outline-offset: -4px;
        }
    }
    output {
        width: 32px;
        text-align: center;
        font-weight: 600;
        font-size: 16px;
        color: var(--dh-ink);
    }
`

interface QuantityStepperProps {
    value: number
    onIncrement: () => void
    onDecrement: () => void
    min?: number
    max?: number
}

function QuantityStepper({ value, onIncrement, onDecrement, min = 1, max = MAX_CART_QUANTITY }: QuantityStepperProps): JSX.Element {
    return (
        <Stepper role="group" aria-label="Cantidad">
            <button type="button" onClick={onDecrement} disabled={value <= min} aria-label="Quitar uno">−</button>
            <output aria-live="polite" aria-label="Cantidad">{value}</output>
            <button type="button" onClick={onIncrement} disabled={value >= max} aria-label="Agregar uno">+</button>
        </Stepper>
    )
}

export default QuantityStepper
