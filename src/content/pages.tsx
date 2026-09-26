import Accordion, { AccordionItem } from '@/components/Accordion'
import { Cut, isConfigured, site } from '@/config/site'
import { buildWhatsappUrl } from '@/data/whatsapp'
import { StaticPageProps } from '@/views/static/StaticPage'
import { Link } from 'react-router-dom'

// Contenido de las páginas estáticas (spec R2.4 / R0.1 / handoff spec 05).
//
// REGLA: ningún dato de negocio se inventa. Todo fragmento que depende de una
// clave `TODO(spec-05)` de site.ts se omite con `isConfigured(...)`; cuando una
// página entera no tiene contenido definido se muestra <Pending/> ("Contenido
// en preparación"), NUNCA texto de relleno.
//
// TODO(spec-05): al completar site.ts (razón social, horario, courier, días,
// pasarela, política de cambios, textos legales) estas páginas se completan
// solas; revisar el copy resultante una vez con datos reales.

const { shipping, payments, returns, customization, contact, legal, sizes } = site

/** Marcador visible para contenido aún no definido por el negocio. */
function Pending({ what = 'Contenido en preparación.' }: { what?: string }): JSX.Element {
    return <p><span className="pending" role="status">{what}</span></p>
}

const whatsappHelpHref = buildWhatsappUrl('👋 Hola, tengo una duda sobre la tienda.')

// ---------------------------------------------------------------------------
// FAQ (spec 05 · textos con placeholders → fragmentos condicionales)
// ---------------------------------------------------------------------------

function shippingAnswer(): string {
    const parts = ['Enviamos a todo el Perú.']
    if (isConfigured('shipping.limaDays')) parts.push(`Lima: ${shipping.limaDays} días hábiles.`)
    if (isConfigured('shipping.provinceDays')) parts.push(`Provincias: ${shipping.provinceDays} días hábiles.`)
    if (shipping.hasTracking === true) parts.push('Te enviamos el código de seguimiento por WhatsApp y correo.')
    return parts.join(' ')
}

function returnsAnswer(): string {
    const head = isConfigured('returns.days')
        ? `Sí, dentro de ${returns.days} días si está sin uso y con etiqueta.`
        : 'Sí, si está sin uso y con etiqueta.'
    return `${head} Los productos personalizados solo se cambian por fallas.`
}

function paymentsAnswer(): string {
    const parts = [
        isConfigured('payments.gateway')
            ? `Yape, Plin, transferencia y tarjeta de crédito o débito vía ${payments.gateway}.`
            : 'Yape, Plin y transferencia.'
    ]
    if (payments.yapePlinIntegrated === true) parts.push('El pago con Yape o Plin se confirma automáticamente.')
    if (payments.yapePlinIntegrated === false) parts.push('El pago con Yape o Plin se confirma manualmente al recibir tu comprobante.')
    return parts.join(' ')
}

function customizationAnswer(): string {
    const hours = isConfigured('customization.mockupHours') ? ` (en ${customization.mockupHours} horas)` : ''
    return `Nos envías tu idea por WhatsApp, te mandamos un mockup para aprobar${hours} y recién ahí lo producimos.`
}

const hasSizeMeasures = isConfigured('sizes.hombre.rows') && isConfigured('sizes.mujer.rows')

export const faqItems: AccordionItem[] = [
    { id: 'envio', question: '¿Cuánto demora el envío?', answer: shippingAnswer() },
    {
        id: 'talla',
        question: '¿Cómo elijo mi talla?',
        answer: (
            <p>
                Revisa la <Link to="/guia-de-tallas">guía de tallas</Link>
                {hasSizeMeasures ? ': medidas de ancho de pecho y largo en cm, para corte hombre y mujer.' : ' para corte hombre y mujer.'}
                {' '}Si dudas entre dos, escríbenos.
            </p>
        )
    },
    { id: 'cambios', question: '¿Puedo cambiar mi producto?', answer: returnsAnswer() },
    { id: 'pagos', question: '¿Qué medios de pago aceptan?', answer: paymentsAnswer() },
    { id: 'personalizacion', question: '¿Cómo funciona la personalización?', answer: customizationAnswer() }
]

function HelpIntro(): JSX.Element {
    const hours = isConfigured('contact.hours') ? ` en horario de atención ${contact.hours}` : ''
    return (
        <>
            ¿Otra duda?{' '}
            {whatsappHelpHref
                ? <><a href={whatsappHelpHref} target="_blank" rel="noreferrer">Escríbenos por WhatsApp</a> y te respondemos{hours}.</>
                : <>Escríbenos y te respondemos{hours}.</>}
        </>
    )
}

const ayuda: StaticPageProps = {
    title: 'Ayuda',
    intro: <HelpIntro />,
    sections: [
        { heading: 'Preguntas frecuentes', body: <Accordion items={faqItems} /> }
    ]
}

// ---------------------------------------------------------------------------
// Guía de tallas (spec R2.4): tabla solo si TODAS las filas tienen cm.
// ---------------------------------------------------------------------------

function SizeTable({ cut }: { cut: Cut }): JSX.Element {
    const table = sizes[cut]
    const complete = isConfigured(`sizes.${cut}.rows`)
    return (
        <>
            <p>{table.description}.</p>
            {complete ? (
                <div className="table_scroll">
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
                </div>
            ) : (
                <>
                    <ul className="size_list" aria-label={`Tallas ${table.label}`}>
                        {table.rows.map((row) => <li key={row.talla}>{row.talla}</li>)}
                    </ul>
                    <Pending what="Medidas en cm pendientes de confirmación." />
                </>
            )}
        </>
    )
}

const guiaDeTallas: StaticPageProps = {
    title: 'Guía de tallas',
    intro: 'Los polos vienen en dos cortes. Mide un polo que te quede bien y compara: ancho de pecho de costura a costura y largo desde el hombro.',
    sections: [
        { heading: sizes.hombre.label, body: <SizeTable cut="hombre" /> },
        { heading: sizes.mujer.label, body: <SizeTable cut="mujer" /> }
    ]
}

// ---------------------------------------------------------------------------
// Envíos y tiempos
// ---------------------------------------------------------------------------

function CoverageBody(): JSX.Element {
    const courier = isConfigured('shipping.courier') ? ` Trabajamos con ${shipping.courier}.` : ''
    const tracking = shipping.hasTracking === true ? ' Te enviamos el código de seguimiento por WhatsApp y correo.' : ''
    return <p>Enviamos a todo el Perú.{courier}{tracking}</p>
}

function DeliveryTimesBody(): JSX.Element {
    const lima = isConfigured('shipping.limaDays')
    const province = isConfigured('shipping.provinceDays')
    if (!lima && !province) return <Pending what="Tiempos de entrega pendientes de confirmación." />
    return (
        <ul>
            {lima && <li>Lima: {shipping.limaDays} días hábiles.</li>}
            {province && <li>Provincias: {shipping.provinceDays} días hábiles.</li>}
        </ul>
    )
}

const envios: StaticPageProps = {
    title: 'Envíos y tiempos',
    sections: [
        { heading: 'Cobertura', body: <CoverageBody /> },
        { heading: 'Tiempos de entrega', body: <DeliveryTimesBody /> },
        {
            heading: 'Envío gratis',
            body: <p>Envío gratis en compras desde S/ {shipping.freeFrom}.</p>,
            show: isConfigured('shipping.freeFrom')
        },
        {
            heading: 'Costo de envío',
            body: <p>El costo de envío se calcula al pagar, según tu dirección.</p>,
            show: isConfigured('payments.gateway')
        }
    ]
}

// ---------------------------------------------------------------------------
// Cambios y devoluciones
// ---------------------------------------------------------------------------

const whatsappReturnsHref = buildWhatsappUrl('👋 Hola, quiero solicitar un cambio de mi pedido.')

const cambios: StaticPageProps = {
    title: 'Cambios y devoluciones',
    sections: [
        {
            heading: 'Plazo',
            body: isConfigured('returns.days')
                ? <p>Tienes {returns.days} días desde que recibes tu pedido para solicitar un cambio.</p>
                : <Pending what="Plazo de cambios pendiente de confirmación." />
        },
        {
            heading: 'Condiciones',
            body: isConfigured('returns.conditions')
                ? <p>{returns.conditions}</p>
                : <p>El producto debe estar sin uso y con etiqueta.</p>
        },
        {
            heading: 'Productos personalizados',
            body: <p>Los productos personalizados solo se cambian por fallas de fabricación.</p>
        },
        {
            heading: '¿Cómo lo solicito?',
            body: <p><a href={whatsappReturnsHref ?? '#'} target="_blank" rel="noreferrer">Escríbenos por WhatsApp</a> con tu código de pedido y una foto del producto.</p>,
            show: whatsappReturnsHref !== null
        }
    ]
}

// ---------------------------------------------------------------------------
// Legales: texto en párrafos desde site.legal.*Text; si TODO → aviso.
// ---------------------------------------------------------------------------

function legalPage(title: string, paragraphs: string[] | null): StaticPageProps {
    const configured = Array.isArray(paragraphs) && paragraphs.length > 0
    return {
        title,
        sections: [
            {
                heading: configured ? 'Texto vigente' : 'Contenido en preparación',
                body: configured
                    ? <>{paragraphs!.map((text, index) => <p key={index}>{text}</p>)}</>
                    : <Pending what="Contenido en preparación. Pronto publicaremos este documento." />
            }
        ]
    }
}

const terminos = legalPage('Términos y condiciones', legal.termsText)
const privacidad = legalPage('Política de privacidad', legal.privacyText)

/** Ruta (sin `/`) → props de StaticPage. App.tsx registra una <Route> por entrada. */
export const STATIC_PAGES: Record<string, StaticPageProps> = {
    'ayuda': ayuda,
    'guia-de-tallas': guiaDeTallas,
    'envios': envios,
    'cambios': cambios,
    'terminos': terminos,
    'privacidad': privacidad
}
