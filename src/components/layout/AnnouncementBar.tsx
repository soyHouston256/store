import styled from 'styled-components'
import { isConfigured, site } from '@/config/site'

// Barra de anuncio (spec R2.1 / R0.1). 40px, tinta con texto crema 13px,
// separadores `·` en amarillo. Tinta y crema son constantes de marca (no
// cambian con el tema, brand/README), por eso no usan `--dh-ink`, que en
// `body.dark-theme` pasa a ser crema.
const Bar = styled.div`
    height: 40px;
    background: #1B1A17;
    color: #FAF6F1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    padding: 0 var(--dh-page-x);
    font-size: 13px;
    letter-spacing: 0.02em;
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;
    .dot {
        color: var(--dh-yellow);
    }
    @media screen and (max-width: 640px) {
        gap: 10px;
        font-size: 12px;
    }
`

/** Fragmentos visibles: los que dependen de datos de negocio se ocultan si son TODO. */
export function announcementFragments(): string[] {
    const fragments = ['Envío a todo el Perú']
    if (isConfigured('shipping.freeFrom')) fragments.push(`Gratis desde S/ ${site.shipping.freeFrom}`)
    fragments.push(isConfigured('payments.gateway') ? 'Paga con Yape, Plin o tarjeta' : 'Paga con Yape, Plin')
    return fragments
}

function AnnouncementBar(): JSX.Element {
    const fragments = announcementFragments()
    return (
        <Bar role="note" aria-label="Información de envío y pagos">
            {fragments.map((text, index) => (
                <span key={text} style={{ display: 'contents' }}>
                    {index > 0 && <span className="dot" aria-hidden="true">·</span>}
                    <span>{text}</span>
                </span>
            ))}
        </Bar>
    )
}

export default AnnouncementBar
