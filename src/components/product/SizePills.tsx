import { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import type { Cut } from '@/types/ProductType'
import { isConfigured, site } from '@/config/site'
import { FieldHeader } from '@/components/product/FieldHeader'

// Tallas (spec R5.3 (6), canvas): pills 60×48 radio 12, 15/600; seleccionada =
// fondo tinta / texto crema. Con `soldOut` todas quedan `disabled` y tachadas.
// "Guía de tallas" despliega la tabla del corte activo con la regla de R2.4:
// tabla `Talla · Ancho pecho (cm) · Largo (cm)` solo si TODAS las filas tienen
// cm (`isConfigured('sizes.<corte>.rows')`); si no, lista + aviso de pendiente.
const Pills = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    button {
        width: 60px;
        height: 48px;
        border-radius: 12px;
        border: 1.5px solid var(--dh-line-2);
        background: var(--dh-surface);
        color: var(--dh-ink);
        font-family: inherit;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        box-sizing: border-box;
        transition: border-color .15s ease, background .15s ease, color .15s ease;
        &:hover:not(:disabled) {
            border-color: var(--dh-ink);
        }
        &[aria-pressed="true"] {
            background: var(--dh-ink);
            border-color: var(--dh-ink);
            color: var(--color-text-invert);
        }
        &:disabled {
            color: var(--dh-muted);
            text-decoration: line-through;
            cursor: not-allowed;
            background: var(--dh-sand);
        }
        &:focus-visible {
            outline: 2px solid var(--dh-ink);
            outline-offset: 2px;
        }
    }
`
const GuideToggle = styled.button`
    background: transparent;
    border: none;
    padding: 0;
    min-height: 32px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 3px;
    color: var(--dh-ink);
    cursor: pointer;
    &:focus-visible {
        outline: 2px solid var(--dh-ink);
        outline-offset: 2px;
        border-radius: 4px;
    }
`
const Guide = styled.div`
    margin-top: 12px;
    background: var(--dh-surface);
    border: 1px solid var(--dh-line);
    border-radius: 12px;
    overflow: hidden;
    font-size: 14px;
    color: var(--dh-ink);
    .guide_title {
        display: block;
        padding: 10px 14px 0;
        font-size: 13px;
        font-weight: 600;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        th, td {
            text-align: left;
            padding: 10px 14px;
        }
        th {
            font-weight: 600;
            color: var(--dh-muted);
        }
        tbody tr {
            border-top: 1px solid var(--dh-line);
        }
    }
    .guide_list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        list-style: none;
        margin: 0;
        padding: 10px 14px 0;
        li {
            min-width: 40px;
            height: 32px;
            padding: 0 10px;
            border-radius: 16px;
            border: 1px solid var(--dh-line-2);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
        }
    }
    .guide_note {
        margin: 0;
        padding: 10px 14px 12px;
        color: var(--dh-muted);
        font-size: 13px;
        a {
            color: var(--dh-ink);
            text-decoration: underline;
            text-underline-offset: 3px;
        }
    }
`

const guideTitle = (cut: Cut): string => {
    // "Hombre — corte recto" → "Medidas corte hombre (recto)"; "Mujer — entallado" → "Medidas corte mujer (entallado)"
    const [, kind] = site.sizes[cut].label.split('—')
    const detail = (kind ?? '').trim().replace(/^corte\s+/i, '')
    return `Medidas corte ${cut}${detail ? ` (${detail})` : ''}`
}

export function SizeGuide({ cut }: { cut: Cut }): JSX.Element {
    const table = site.sizes[cut]
    const complete = isConfigured(`sizes.${cut}.rows`)
    return (
        <Guide role="region" aria-label={guideTitle(cut)}>
            <span className="guide_title">{guideTitle(cut)}</span>
            {complete ? (
                <table>
                    <thead>
                        <tr><th scope="col">Talla</th><th scope="col">Ancho pecho (cm)</th><th scope="col">Largo (cm)</th></tr>
                    </thead>
                    <tbody>
                        {table.rows.map((row) => (
                            <tr key={row.talla}><td>{row.talla}</td><td>{row.anchoPechoCm}</td><td>{row.largoCm}</td></tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <>
                    <ul className="guide_list" aria-label={`Tallas ${table.label}`}>
                        {table.rows.map((row) => <li key={row.talla}>{row.talla}</li>)}
                    </ul>
                    <p className="guide_note">Medidas en cm pendientes de confirmación. <Link to="/guia-de-tallas">Ver guía de tallas</Link></p>
                </>
            )}
        </Guide>
    )
}

interface SizePillsProps {
    sizes: string[]
    value?: string
    onChange: (size: string) => void
    /** Corte activo: título y filas de la guía. */
    cut?: Cut
    soldOut?: boolean
    required?: boolean
}

function SizePills({ sizes, value, onChange, cut, soldOut, required }: SizePillsProps): JSX.Element | null {
    const [showGuide, setShowGuide] = useState(false)
    if (sizes.length === 0) return null
    const guideCut = cut ?? 'hombre'
    return (
        <div>
            <FieldHeader
                label="Talla"
                value={value}
                required={required}
                aside={(
                    <GuideToggle type="button" aria-expanded={showGuide} onClick={() => setShowGuide((open) => !open)}>
                        {showGuide ? 'Ocultar guía de tallas' : 'Guía de tallas'}
                    </GuideToggle>
                )}
            />
            <Pills role="group" aria-label="Talla">
                {sizes.map((size) => (
                    <button
                        key={size}
                        type="button"
                        aria-pressed={value === size}
                        aria-label={`Talla ${size}${soldOut ? ' agotada' : ''}`}
                        disabled={soldOut}
                        onClick={() => onChange(size)}
                    >
                        {size}
                    </button>
                ))}
            </Pills>
            {showGuide && <SizeGuide cut={guideCut} />}
        </div>
    )
}

export default SizePills
