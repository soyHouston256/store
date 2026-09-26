import styled from 'styled-components'
import Accordion from '@/components/Accordion'
import Container from '@/components/layout/Container'
import { HelpIntro, faqItems } from '@/content/pages'

// FAQ en home (spec 02 §7 / R3.7, canvas Home.dc.html #faq): grid 3 (título +
// intro · acordeón en 2 columnas). Reutiliza el acordeón exclusivo y el contenido
// de /ayuda (src/content/pages.tsx), con los fragmentos condicionados por site.ts.
const Grid = styled(Container)`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 40px;
    padding-top: 80px;
    h2 {
        margin: 0;
        font-family: var(--dh-font-display);
        font-size: var(--dh-text-h2);
        font-weight: 800;
        letter-spacing: -0.02em;
        line-height: 1.05;
        color: var(--dh-ink);
    }
    .intro {
        margin: 12px 0 0;
        font-size: 15px;
        line-height: 1.55;
        color: var(--dh-muted);
        a {
            color: var(--dh-ink);
            text-decoration: underline;
            text-underline-offset: 3px;
        }
    }
    .list {
        grid-column: span 2;
    }
    @media screen and (max-width: 1024px){
        grid-template-columns: 1fr;
        gap: 24px;
        padding-top: 56px;
        .list {
            grid-column: auto;
        }
    }
    @media screen and (max-width: 640px){
        padding-top: 40px;
        h2 {
            font-size: 32px;
        }
    }
`

function Faq(): JSX.Element {
    return (
        <Grid as="section" id="faq" aria-labelledby="faq-title">
            <div>
                <h2 id="faq-title">Preguntas frecuentes</h2>
                <p className="intro"><HelpIntro /></p>
            </div>
            <div className="list">
                <Accordion items={faqItems} />
            </div>
        </Grid>
    )
}

export default Faq
