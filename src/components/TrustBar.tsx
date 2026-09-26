import styled from 'styled-components'
import Container from '@/components/layout/Container'
import { isConfigured, site } from '@/config/site'

// Barra de confianza (spec 02 §5 / R3.7 / R0.1). Reemplaza Benefits.tsx.
// Cuatro ítems con íconos stroke; cada fragmento con placeholder pasa por
// `isConfigured`. Candidatos en orden de prioridad, se toman los 4 primeros:
// Envío · Pago · [Cambios en N días] · [Material/técnica] · Hecho en Perú ·
// Personaliza desde S/ 15. Con todo TODO → Envío, Yape/Plin/transferencia,
// Hecho en Perú, Personaliza (escenario spec R3.7).
const Grid = styled(Container)`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    padding-top: 56px;
    @media screen and (max-width: 1024px){
        grid-template-columns: repeat(2, minmax(0, 1fr));
        padding-top: 40px;
    }
    @media screen and (max-width: 640px){
        grid-template-columns: 1fr;
        padding-top: 32px;
    }
`
const Item = styled.li`
    display: flex;
    gap: 14px;
    align-items: flex-start;
    svg {
        width: 28px;
        height: 28px;
        flex-shrink: 0;
        stroke: var(--dh-ink);
    }
    .title {
        font-weight: 600;
        font-size: 15px;
        color: var(--dh-ink);
    }
    .desc {
        font-size: 14px;
        color: var(--dh-muted);
        margin-top: 2px;
    }
`

type IconKey = 'truck' | 'card' | 'refresh' | 'shirt' | 'peru' | 'pencil'

const ICONS: Record<IconKey, JSX.Element> = {
    truck: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.6" /><circle cx="17" cy="17.5" r="1.6" /></svg>,
    card: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /></svg>,
    refresh: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" /></svg>,
    shirt: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 4l-5 3 2 4 2-1v10h10V10l2 1 2-4-5-3a4 4 0 0 1-8 0z" /></svg>,
    peru: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-6-5.2-6-11a6 6 0 0 1 12 0c0 5.8-6 11-6 11z" /><circle cx="12" cy="10" r="2.2" /></svg>,
    pencil: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20l1.2-4.2L15.8 5.2a2 2 0 0 1 2.9 0l.1.1a2 2 0 0 1 0 2.9L8.2 18.8z" /></svg>
}

export interface TrustItem {
    icon: IconKey
    title: string
    desc?: string
}

export function trustItems(): TrustItem[] {
    const { shipping, payments, returns, product, customization } = site
    const candidates: TrustItem[] = []

    candidates.push({
        icon: 'truck',
        title: 'Envío a todo el Perú',
        desc: isConfigured('shipping.courier')
            ? `Courier ${shipping.courier}${shipping.hasTracking === true ? ' con código de seguimiento' : ''}`
            : undefined
    })

    candidates.push(isConfigured('payments.gateway')
        ? { icon: 'card', title: 'Yape, Plin o tarjeta', desc: `Pago seguro con ${payments.gateway}` }
        : { icon: 'card', title: 'Yape, Plin o transferencia' })

    if (isConfigured('returns.days')) {
        candidates.push({ icon: 'refresh', title: `Cambios en ${returns.days} días`, desc: 'Si la talla no te queda, la cambiamos' })
    }

    if (isConfigured('product.material')) {
        candidates.push({
            icon: 'shirt',
            title: `${product.material}`,
            desc: isConfigured('product.printTechnique') ? `Estampado ${product.printTechnique} que no se despega` : undefined
        })
    }

    candidates.push({ icon: 'peru', title: 'Hecho en Perú' })
    candidates.push({ icon: 'pencil', title: `Personaliza desde S/ ${customization.fromPrice}` })

    return candidates.slice(0, 4)
}

function TrustBar(): JSX.Element {
    const items = trustItems()
    return (
        <Grid as="ul" aria-label="Por qué comprar en devhaus.pe">
            {items.map((item) => (
                <Item key={item.title}>
                    {ICONS[item.icon]}
                    <div>
                        <div className="title">{item.title}</div>
                        {item.desc && <div className="desc">{item.desc}</div>}
                    </div>
                </Item>
            ))}
        </Grid>
    )
}

export default TrustBar
