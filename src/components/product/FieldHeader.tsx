import { ReactNode } from 'react'
import styled from 'styled-components'

// Cabecera de campo de la ficha (canvas Producto.dc.html): "Corte: Hombre — corte
// recto" en 14px con la etiqueta en 600, y un slot a la derecha (p. ej. "Guía de
// tallas"). `required` muestra el aviso "requerido" (heredado del modal) cuando
// el usuario intenta agregar sin completar el campo.
const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
    font-size: 14px;
    color: var(--dh-ink);
    .field_label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        b {
            font-weight: 600;
        }
    }
    .field_required {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: var(--color-error);
        font-size: 12px;
        font-weight: 600;
        svg {
            width: 14px;
            height: 14px;
        }
    }
`

interface FieldHeaderProps {
    label: string
    value?: string
    required?: boolean
    aside?: ReactNode
}

export function FieldHeader({ label, value, required, aside }: FieldHeaderProps): JSX.Element {
    return (
        <Header>
            <span className="field_label">
                <b>{label}:</b>
                {value && <span>{value}</span>}
                {required && (
                    <span className="field_required" role="alert">
                        <svg viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M128 20a108 108 0 1 0 108 108A108.1 108.1 0 0 0 128 20Zm0 192a84 84 0 1 1 84-84a84.1 84.1 0 0 1-84 84Zm-12-80V80a12 12 0 0 1 24 0v52a12 12 0 0 1-24 0Zm28 40a16 16 0 1 1-16-16a16 16 0 0 1 16 16Z" /></svg>
                        requerido
                    </span>
                )}
            </span>
            {aside}
        </Header>
    )
}

export default FieldHeader
