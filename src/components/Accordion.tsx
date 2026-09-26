import { ReactNode, useState } from 'react'
import styled from 'styled-components'

// Acordeón exclusivo (spec R2.4): un solo panel abierto, el primero abierto
// por defecto, `aria-expanded` en el botón. Medidas del canvas Home.dc.html
// (#faq): fila min-height 60, pregunta 17px/600, respuesta 15px/1.6.
export interface AccordionItem {
    id: string
    question: string
    answer: ReactNode
}

const List = styled.div`
    display: flex;
    flex-direction: column;
    .accordion_item {
        border-bottom: 1px solid var(--dh-line);
    }
    .accordion_trigger {
        width: 100%;
        min-height: 60px;
        background: transparent;
        border: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        text-align: left;
        font-family: inherit;
        font-size: 17px;
        font-weight: 600;
        color: var(--dh-ink);
        padding: 12px 0;
        cursor: pointer;
        .sign {
            font-size: 22px;
            font-weight: 400;
            line-height: 1;
            flex-shrink: 0;
        }
        &:hover {
            color: var(--dh-accent);
        }
        &:focus-visible {
            outline: 2px solid var(--dh-ink);
            outline-offset: 2px;
            border-radius: 4px;
        }
    }
    .accordion_panel {
        margin: 0 0 18px;
        font-size: 15px;
        line-height: 1.6;
        color: var(--dh-ink-2);
        p {
            margin: 0;
        }
        p + p {
            margin-top: 8px;
        }
        a {
            color: var(--dh-ink);
            text-decoration: underline;
            text-underline-offset: 3px;
        }
    }
`

interface AccordionProps {
    items: AccordionItem[]
    /** Índice abierto al montar; `null` para empezar cerrado. Default: 0 (primer ítem). */
    defaultOpen?: number | null
}

function Accordion({ items, defaultOpen = 0 }: AccordionProps): JSX.Element {
    const [openId, setOpenId] = useState<string | null>(
        defaultOpen === null ? null : items[defaultOpen]?.id ?? null
    )

    return (
        <List>
            {items.map((item) => {
                const isOpen = openId === item.id
                const triggerId = `accordion-${item.id}-trigger`
                const panelId = `accordion-${item.id}-panel`
                return (
                    <div className="accordion_item" key={item.id}>
                        <h3 style={{ margin: 0 }}>
                            <button
                                type="button"
                                id={triggerId}
                                className="accordion_trigger"
                                aria-expanded={isOpen}
                                aria-controls={panelId}
                                onClick={() => setOpenId(isOpen ? null : item.id)}
                            >
                                <span>{item.question}</span>
                                <span className="sign" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                            </button>
                        </h3>
                        {isOpen && (
                            <div id={panelId} role="region" aria-labelledby={triggerId} className="accordion_panel">
                                {typeof item.answer === 'string' ? <p>{item.answer}</p> : item.answer}
                            </div>
                        )}
                    </div>
                )
            })}
        </List>
    )
}

export default Accordion
