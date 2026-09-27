import styled from 'styled-components'
import type { LogoPosition } from '@/types/ProductType'
import { LOGO_POSITION_OPTIONS } from '@/data/logoPositions'
import { FieldHeader } from '@/components/product/FieldHeader'

// Posición del logo (spec R0.2 / R5.3 (5)), extraída del modal: 4 tiles con
// icono + etiqueta, `aria-pressed`. Elegir "Espalda" o "Bolsillo + espalda"
// gira el mockup (lo resuelve `useProductSelection.selectLogoPosition`).
const Options = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    button {
        flex: 1 1 72px;
        min-width: 72px;
        max-width: 96px;
        min-height: 88px;
        padding: 10px 6px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border-radius: 12px;
        border: 1.5px solid var(--dh-line-2);
        background: var(--dh-surface);
        color: var(--dh-ink);
        font-family: inherit;
        cursor: pointer;
        box-sizing: border-box;
        transition: border-color .15s ease, background .15s ease, transform .15s ease;
        svg {
            width: 34px;
            height: 34px;
        }
        small {
            font-size: 11px;
            font-weight: 600;
            line-height: 1.2;
            text-align: center;
            color: var(--dh-muted);
        }
        &:hover {
            border-color: var(--dh-ink);
            transform: translateY(-1px);
        }
        &[aria-pressed="true"] {
            border-color: var(--dh-ink);
            background: var(--dh-sand);
            small {
                color: var(--dh-ink);
            }
        }
        &:focus-visible {
            outline: 2px solid var(--dh-ink);
            outline-offset: 2px;
        }
    }
`

export function LogoPositionIcon({ position }: { position: LogoPosition }): JSX.Element {
    if (position === 'pocket') {
        return (
            <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="10" y="20" width="80" height="90" rx="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                <circle cx="35" cy="45" r="8" fill="currentColor" opacity="0.3"/>
                <rect x="30" y="40" width="10" height="10" fill="currentColor"/>
            </svg>
        )
    }
    if (position === 'chest') {
        return (
            <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="10" y="20" width="80" height="90" rx="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                <circle cx="50" cy="55" r="15" fill="currentColor" opacity="0.3"/>
                <rect x="40" y="45" width="20" height="20" fill="currentColor"/>
            </svg>
        )
    }
    if (position === 'back') {
        return (
            <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="10" y="20" width="80" height="90" rx="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                <circle cx="50" cy="72" r="16" fill="currentColor" opacity="0.35"/>
                <rect x="38" y="60" width="24" height="24" fill="currentColor"/>
            </svg>
        )
    }
    return (
        <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="10" y="20" width="80" height="90" rx="8" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="35" cy="45" r="6" fill="currentColor" opacity="0.3"/>
            <rect x="30" y="40" width="10" height="10" fill="currentColor"/>
            <circle cx="50" cy="80" r="12" fill="currentColor" opacity="0.5"/>
            <rect x="42" y="72" width="16" height="16" fill="currentColor" opacity="0.8"/>
        </svg>
    )
}

interface LogoPositionPickerProps {
    positions: LogoPosition[]
    value?: LogoPosition
    onChange: (position: LogoPosition) => void
    required?: boolean
}

function LogoPositionPicker({ positions, value, onChange, required }: LogoPositionPickerProps): JSX.Element | null {
    if (positions.length === 0) return null
    return (
        <div>
            <FieldHeader label="Posición del logo" value={value ? LOGO_POSITION_OPTIONS[value].label : undefined} required={required} />
            <Options role="group" aria-label="Posición del logo">
                {positions.map((position) => {
                    const option = LOGO_POSITION_OPTIONS[position]
                    return (
                        <button
                            key={position}
                            type="button"
                            aria-pressed={value === position}
                            title={option.title}
                            onClick={() => onChange(position)}
                        >
                            <LogoPositionIcon position={position} />
                            <small>{option.label}</small>
                        </button>
                    )
                })}
            </Options>
        </div>
    )
}

export default LogoPositionPicker
