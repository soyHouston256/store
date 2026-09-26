import Container from '@/components/layout/Container'
import { ReactNode, useEffect } from 'react'
import styled from 'styled-components'

// Página estática genérica (design §4 / spec R2.4): título + secciones
// `{ heading, body, show? }`. El copy vive en src/content/pages.tsx y solo usa
// site.ts: las secciones con `show: false` no se renderizan.
export interface StaticSection {
    heading: string
    body: ReactNode
    show?: boolean
}

export interface StaticPageProps {
    title: string
    intro?: ReactNode
    sections: StaticSection[]
}

const DEFAULT_TITLE = 'devhaus.pe — Polos y accesorios para developers'

const Page = styled(Container)`
    padding-top: 48px;
    padding-bottom: 24px;
    color: var(--dh-ink);
    .page_header {
        max-width: 760px;
        margin-bottom: 40px;
        h1 {
            margin: 0;
            font-family: var(--dh-font-display);
            font-size: var(--dh-text-h2);
            font-weight: 800;
            letter-spacing: -0.02em;
            line-height: 1.1;
        }
        .intro {
            margin: 12px 0 0;
            font-size: 16px;
            line-height: 1.55;
            color: var(--dh-muted);
            a {
                color: var(--dh-ink);
                text-decoration: underline;
                text-underline-offset: 3px;
            }
        }
    }
    .page_sections {
        display: flex;
        flex-direction: column;
        gap: 40px;
        max-width: 760px;
    }
    section h2 {
        margin: 0 0 12px;
        font-family: var(--dh-font-display);
        font-size: var(--dh-text-h3);
        font-weight: 700;
        letter-spacing: -0.01em;
    }
    .prose {
        font-size: 15px;
        line-height: 1.6;
        color: var(--dh-ink-2);
        p {
            margin: 0;
        }
        p + p, ul + p, p + ul, table + p {
            margin-top: 10px;
        }
        ul {
            margin: 0;
            padding-left: 20px;
            list-style: disc;
        }
        a {
            color: var(--dh-ink);
            text-decoration: underline;
            text-underline-offset: 3px;
        }
        .pending {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 14px;
            border-radius: var(--dh-radius-sm);
            border: 1px dashed var(--dh-line-2);
            background: var(--dh-sand);
            color: var(--dh-muted);
            font-size: 14px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
            th, td {
                text-align: left;
                padding: 10px 12px;
                border-bottom: 1px solid var(--dh-line);
            }
            th {
                font-size: 12px;
                font-weight: 600;
                letter-spacing: .08em;
                text-transform: uppercase;
                color: var(--dh-muted);
            }
            td:first-child {
                font-weight: 600;
                color: var(--dh-ink);
            }
        }
        .table_scroll {
            overflow-x: auto;
        }
        .size_list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            list-style: none;
            padding: 0;
            margin: 0 0 12px;
            li {
                min-width: 48px;
                height: 40px;
                padding: 0 14px;
                border-radius: 20px;
                border: 1px solid var(--dh-line-2);
                background: var(--dh-surface);
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                color: var(--dh-ink);
            }
        }
    }
    @media screen and (max-width: 640px) {
        padding-top: 32px;
        .page_header {
            margin-bottom: 28px;
            h1 {
                font-size: 32px;
            }
        }
        .page_sections {
            gap: 32px;
        }
    }
`

function StaticPage({ title, intro, sections }: StaticPageProps): JSX.Element {
    useEffect(() => {
        document.title = `${title} — devhaus.pe`
        return () => {
            document.title = DEFAULT_TITLE
        }
    }, [title])

    const visible = sections.filter((section) => section.show !== false)

    return (
        <Page as="article">
            <header className="page_header">
                <h1>{title}</h1>
                {intro && <p className="intro">{intro}</p>}
            </header>
            <div className="page_sections">
                {visible.map((section) => (
                    <section key={section.heading} aria-labelledby={`section-${slug(section.heading)}`}>
                        <h2 id={`section-${slug(section.heading)}`}>{section.heading}</h2>
                        <div className="prose">{section.body}</div>
                    </section>
                ))}
            </div>
        </Page>
    )
}

const slug = (text: string): string =>
    text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default StaticPage
