import styled from 'styled-components'
import { nearestColorName } from '@/data/colorNames'
import { FieldHeader } from '@/components/product/FieldHeader'

// Swatches de color (spec R5.3 (4), canvas): círculos 44×44, borde 3 con anillo
// tinta en el seleccionado y separación interna del color de fondo; la cabecera
// muestra el nombre ("Color: Negro", `colorNames`).
const Swatches = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    button {
        width: 44px;
        height: 44px;
        border-radius: 22px;
        padding: 0;
        border: 3px solid var(--dh-line-2);
        box-shadow: inset 0 0 0 2px var(--dh-bg);
        cursor: pointer;
        box-sizing: border-box;
        transition: border-color .15s ease, transform .15s ease;
        &:hover {
            transform: translateY(-1px);
        }
        &[aria-pressed="true"] {
            border-color: var(--dh-ink);
        }
        &:focus-visible {
            outline: 2px solid var(--dh-ink);
            outline-offset: 2px;
        }
    }
`

/** Nombre visible del color: tabla `colorNames` o el valor tal cual. */
export const colorName = (color?: string): string | undefined =>
    color ? nearestColorName(color) ?? color : undefined

interface ColorSwatchesProps {
    colors: string[]
    value?: string
    onChange: (color: string) => void
}

function ColorSwatches({ colors, value, onChange }: ColorSwatchesProps): JSX.Element | null {
    if (colors.length === 0) return null
    return (
        <div>
            <FieldHeader label="Color" value={colorName(value)} />
            <Swatches role="group" aria-label="Color">
                {colors.map((color) => {
                    const name = colorName(color) ?? color
                    return (
                        <button
                            key={color}
                            type="button"
                            aria-pressed={value === color}
                            aria-label={name}
                            title={name}
                            style={{ background: color }}
                            onClick={() => onChange(color)}
                        />
                    )
                })}
            </Swatches>
        </div>
    )
}

export default ColorSwatches
