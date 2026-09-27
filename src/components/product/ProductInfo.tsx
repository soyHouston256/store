import { Link } from 'react-router-dom'
import styled from 'styled-components'
import type { AccordionItem } from '@/components/Accordion'
import { has, isConfigured, site } from '@/config/site'
import { returnsAnswer, shippingAnswer } from '@/content/pages'
import { LOGO_POSITION_OPTIONS, logoPositionsFor } from '@/data/logoPositions'
import { CUT_SHORT_LABELS, cutsOf } from '@/data/cuts'
import type { ProductType } from '@/types/ProductType'

// Bloques informativos de la ficha (spec R5.3 (9)(10) / R0.1): caja de entrega y
// contenido del acordeón. REGLA: ningún dato de negocio se inventa; cada
// fragmento que depende de una clave `TODO(spec-05)` de site.ts se omite con
// `isConfigured`, y donde no queda nada se muestra un aviso de pendiente.
// TODO(spec-05): revisar el copy resultante cuando site.ts tenga datos reales.

const { shipping, payments, returns, product: productConfig } = site

export const Pending = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: var(--dh-radius-sm);
    border: 1px dashed var(--dh-line-2);
    background: var(--dh-sand);
    color: var(--dh-muted);
    font-size: 13px;
`

// ---------------------------------------------------------------------------
// Caja de entrega (canvas): Lima/Provincias · cambio de talla · medios de pago
// ---------------------------------------------------------------------------

const Box = styled.div`
    background: var(--dh-surface);
    border: 1px solid var(--dh-line);
    border-radius: 18px;
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 14px;
    color: var(--dh-ink);
    .delivery_row {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        svg {
            width: 22px;
            height: 22px;
            flex-shrink: 0;
            stroke: var(--dh-ink);
        }
        b {
            font-weight: 600;
        }
    }
`

/** "Yape · Plin · Transferencia" (+ " · Tarjeta" solo con pasarela, spec R0.1). */
export const paymentMethodsLabel = (): string =>
    isConfigured('payments.gateway') ? 'Yape · Plin · Tarjeta · Transferencia' : 'Yape · Plin · Transferencia'

export function DeliveryBox(): JSX.Element {
    const lima = isConfigured('shipping.limaDays')
    const province = isConfigured('shipping.provinceDays')
    const returnsDays = isConfigured('returns.days')
    return (
        <Box aria-label="Entrega y pagos">
            {(lima || province) && (
                <div className="delivery_row">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.6" /><circle cx="17" cy="17.5" r="1.6" /></svg>
                    <div>
                        {lima && <><b>Lima:</b> llega en {shipping.limaDays} días hábiles</>}
                        {lima && province && ' · '}
                        {province && <><b>Provincias:</b> {shipping.provinceDays} días hábiles</>}
                    </div>
                </div>
            )}
            {returnsDays && (
                <div className="delivery_row">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" /></svg>
                    <div>Cambio de talla en {returns.days} días</div>
                </div>
            )}
            <div className="delivery_row">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /></svg>
                <div>{paymentMethodsLabel()}</div>
            </div>
        </Box>
    )
}

// ---------------------------------------------------------------------------
// Acordeón: Descripción · Material y cuidado · Envíos y cambios
// ---------------------------------------------------------------------------

const KIND_LABELS = { polo: 'polo', taza: 'taza', mousepad: 'mousepad' } as const

function DescriptionBody({ product }: { product: ProductType }): JSX.Element {
    const kind = product.type ?? 'polo'
    const positions = logoPositionsFor(product)
    const cuts = cutsOf(product)
    const colors = product.colors ?? []
    return (
        <>
            <p>{product.name} — {KIND_LABELS[kind]} de diseño original de devhaus.pe para developers.</p>
            {kind === 'polo' && positions.length > 0 && (
                <p>Logo en la posición que elijas: {positions.map((position) => LOGO_POSITION_OPTIONS[position].label.toLowerCase()).join(', ')}.</p>
            )}
            {kind === 'polo' && cuts.length > 0 && (
                <p>Corte {cuts.map((cut) => CUT_SHORT_LABELS[cut].toLowerCase()).join(' y ')}{colors.length > 0 ? ` · ${colors.length} ${colors.length === 1 ? 'color' : 'colores'}` : ''}.</p>
            )}
        </>
    )
}

function MaterialBody({ product }: { product: ProductType }): JSX.Element {
    const kind = product.type ?? 'polo'
    const specs: string[] = []
    if (isConfigured('product.material')) specs.push(productConfig.material as string)
    if (isConfigured('product.grammage')) specs.push(`${productConfig.grammage} g/m²`)
    if (productConfig.prewashed === true) specs.push('tela prelavada')
    const technique = isConfigured('product.printTechnique') ? `Estampado: ${productConfig.printTechnique}.` : ''
    if (kind === 'mousepad' && isConfigured('product.mousepadSize')) specs.push(`${productConfig.mousepadSize}`)
    if (kind === 'taza' && isConfigured('product.mugMl')) specs.push(`${productConfig.mugMl} ml`)
    const hasSpecs = specs.length > 0 || has(technique)
    return (
        <>
            {specs.length > 0 && <p>{specs.join(' · ')}</p>}
            {technique && <p>{technique}</p>}
            {!hasSpecs && <p><Pending role="status">Ficha técnica pendiente de confirmación.</Pending></p>}
            {kind === 'polo' && <p>Lavar al revés en agua fría. No usar lejía. No planchar sobre el estampado.</p>}
        </>
    )
}

function ShippingBody(): JSX.Element {
    return (
        <>
            <p>{shippingAnswer()}</p>
            <p>{returnsAnswer()}</p>
            <p><Link to="/envios">Ver envíos y tiempos</Link> · <Link to="/cambios">Ver cambios y devoluciones</Link></p>
        </>
    )
}

export function productAccordionItems(product: ProductType): AccordionItem[] {
    return [
        { id: 'descripcion', question: 'Descripción', answer: <DescriptionBody product={product} /> },
        { id: 'material', question: 'Material y cuidado', answer: <MaterialBody product={product} /> },
        { id: 'envios', question: 'Envíos y cambios', answer: <ShippingBody /> }
    ]
}

/** Nota bajo el precio (spec R5.3 (2)): "IGV incluido" + " · Envío se calcula al pagar" solo con pasarela. */
export const priceNote = (): string =>
    has(payments.gateway) ? 'IGV incluido · Envío se calcula al pagar' : 'IGV incluido'
