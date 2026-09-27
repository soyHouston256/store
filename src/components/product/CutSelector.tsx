import styled from 'styled-components'
import type { Cut } from '@/types/ProductType'
import { CUT_DESCRIPTIONS, CUT_LABELS, CUT_SHORT_LABELS } from '@/data/cuts'
import { CutSilhouette } from '@/components/CutSegmented'
import { FieldHeader } from '@/components/product/FieldHeader'

// Selector de corte de la ficha (spec 04 "UI — Ficha" / R5.3 (3), canvas
// Producto.dc.html): pastilla --dh-sand-2 padding 5, grid 2 columnas, botones
// 64 alto radio 14 con silueta 36 + título 15/700 + subtítulo 12. Activo: fondo
// superficie + borde 1.5 tinta. Con un solo corte se muestra la etiqueta fija.
const Options = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    padding: 5px;
    border-radius: 18px;
    background: var(--dh-sand-2);
    button {
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 64px;
        padding: 0 14px;
        border-radius: 14px;
        border: 1.5px solid transparent;
        background: transparent;
        color: var(--dh-ink);
        font-family: inherit;
        text-align: left;
        cursor: pointer;
        transition: background .15s ease, border-color .15s ease;
        svg {
            width: 36px;
            height: 36px;
            flex-shrink: 0;
        }
        span {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        b {
            font-size: 15px;
            font-weight: 700;
            line-height: 1.2;
        }
        small {
            font-size: 12px;
            color: var(--dh-muted);
            line-height: 1.2;
        }
        &[aria-pressed="true"] {
            background: var(--dh-surface);
            border-color: var(--dh-ink);
        }
        &:focus-visible {
            outline: 2px solid var(--dh-ink);
            outline-offset: 2px;
        }
    }
    @media screen and (max-width: 425px) {
        grid-template-columns: 1fr;
    }
`

interface CutSelectorProps {
    cuts: Cut[]
    value?: Cut
    onChange: (cut: Cut) => void
    required?: boolean
}

function CutSelector({ cuts, value, onChange, required }: CutSelectorProps): JSX.Element | null {
    if (cuts.length === 0) return null
    const label = value ? CUT_LABELS[value] : undefined
    if (cuts.length === 1) {
        return <FieldHeader label="Corte" value={label ?? CUT_LABELS[cuts[0]]} />
    }
    return (
        <div>
            <FieldHeader label="Corte" value={label} required={required} />
            <Options role="group" aria-label="Corte del polo">
                {cuts.map((cut) => (
                    <button
                        key={cut}
                        type="button"
                        aria-pressed={value === cut}
                        title={CUT_LABELS[cut]}
                        onClick={() => onChange(cut)}
                    >
                        <CutSilhouette cut={cut} size={36} />
                        <span>
                            <b>{CUT_SHORT_LABELS[cut]}</b>
                            <small>{CUT_DESCRIPTIONS[cut]}</small>
                        </span>
                    </button>
                ))}
            </Options>
        </div>
    )
}

export default CutSelector
