import styled from 'styled-components'
import Container from '@/components/layout/Container'
import { has, isConfigured, site } from '@/config/site'
import { buildWhatsappUrl } from '@/data/whatsapp'

// Bloque de personalización (spec 02 §4 / R3.7, canvas Home.dc.html #personaliza):
// fondo tinta radio 28, "// personalización" mono amarillo, h2 44/800, CTA amarillo
// "Empezar por WhatsApp →" (oculto sin número, R1.6) y 4 pasos con número mono
// verde. Paso 03 añade "(en N horas)" y 04 "Lima N días · Provincias N días" solo
// si están configurados (R0.1). Tinta/crema son constantes de marca.
const Section = styled(Container)`
    padding-top: 80px;
    @media screen and (max-width: 1024px){
        padding-top: 56px;
    }
    @media screen and (max-width: 640px){
        padding-top: 40px;
    }
`
const Block = styled.div`
    border-radius: var(--dh-radius-xl);
    background: #1B1A17;
    color: #FAF6F1;
    padding: 56px;
    display: flex;
    flex-direction: column;
    gap: 36px;
    .head {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 24px;
        flex-wrap: wrap;
    }
    .mono {
        font-family: var(--dh-font-mono);
        font-size: 13px;
        color: #E9B949;
    }
    h2 {
        margin: 8px 0 0;
        font-family: var(--dh-font-display);
        font-size: 44px;
        font-weight: 800;
        letter-spacing: -0.02em;
        line-height: 1.05;
    }
    .cta {
        height: 52px;
        padding: 0 26px;
        border-radius: 26px;
        background: #E9B949;
        color: #1B1A17;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-weight: 700;
        font-size: 16px;
        text-decoration: none;
        white-space: nowrap;
        flex-shrink: 0;
        transition: background .15s ease;
        &:hover {
            background: #D9A62E;
        }
        &:focus-visible {
            outline: 2px solid #FAF6F1;
            outline-offset: 3px;
        }
    }
    .steps {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
        margin: 0;
        padding: 0;
        list-style: none;
    }
    .step {
        border: 1px solid #3A3833;
        border-radius: 18px;
        padding: 22px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        .num {
            font-family: var(--dh-font-mono);
            font-size: 14px;
            color: #7FA894;
        }
        .title {
            font-size: 18px;
            font-weight: 600;
        }
        .desc {
            font-size: 14px;
            line-height: 1.5;
            color: #CFC8BD;
        }
    }
    @media screen and (max-width: 1024px){
        padding: 40px 32px;
        gap: 28px;
        h2 {
            font-size: 36px;
        }
        .steps {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }
    @media screen and (max-width: 640px){
        padding: 28px 20px;
        border-radius: var(--dh-radius-lg);
        h2 {
            font-size: 30px;
        }
        .steps {
            grid-template-columns: 1fr;
            gap: 12px;
        }
        .cta {
            width: 100%;
            justify-content: center;
        }
    }
`

function mockupStep(): string {
    return isConfigured('customization.mockupHours')
        ? `Te enviamos una vista previa en ${site.customization.mockupHours} horas.`
        : 'Te enviamos una vista previa para que la apruebes.'
}

function deliveryStep(): string {
    const parts: string[] = []
    if (has(site.shipping.limaDays)) parts.push(`Lima ${site.shipping.limaDays} días`)
    if (has(site.shipping.provinceDays)) parts.push(`Provincias ${site.shipping.provinceDays} días`)
    return parts.length ? `${parts.join(' · ')}.` : 'Envío a todo el Perú.'
}

export const CUSTOMIZE_STEPS = (): { num: string; title: string; desc: string }[] => [
    { num: '01', title: 'Elige el producto', desc: 'Polo, mousepad o taza. Color y talla.' },
    { num: '02', title: 'Envía tu idea', desc: 'Un logo, una frase o un snippet. En PNG o texto.' },
    { num: '03', title: 'Aprueba el mockup', desc: mockupStep() },
    { num: '04', title: 'Recíbelo en casa', desc: deliveryStep() }
]

function Customize(): JSX.Element {
    const whatsappHref = buildWhatsappUrl('👋 Hola, quiero personalizar un diseño.')
    const steps = CUSTOMIZE_STEPS()
    return (
        <Section as="section" id="personaliza" aria-labelledby="personaliza-title">
            <Block>
                <div className="head">
                    <div>
                        <span className="mono" aria-hidden="true">// personalización</span>
                        <h2 id="personaliza-title">Tu stack, tu diseño. Desde S/ {site.customization.fromPrice}.</h2>
                    </div>
                    {whatsappHref && (
                        <a className="cta" href={whatsappHref} target="_blank" rel="noreferrer">Empezar por WhatsApp →</a>
                    )}
                </div>
                <ol className="steps">
                    {steps.map((step) => (
                        <li className="step" key={step.num}>
                            <span className="num" aria-hidden="true">{step.num}</span>
                            <span className="title">{step.title}</span>
                            <span className="desc">{step.desc}</span>
                        </li>
                    ))}
                </ol>
            </Block>
        </Section>
    )
}

export default Customize
