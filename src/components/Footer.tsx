import { DevhausLogo } from "@/components/Logo"
import Container from "@/components/layout/Container"
import { HELP_LINKS, NAV_LINKS } from "@/components/layout/navLinks"
import { isConfigured, site } from "@/config/site"
import { buildWhatsappUrl } from "@/data/whatsapp"
import { Link } from "react-router-dom"
import styled from "styled-components"

// Footer global devhaus (spec R2.3 / spec 01). Fondo --dh-sand-2, 4 columnas:
// marca · TIENDA · AYUDA · LEGAL. Todo dato de negocio sale de site.ts y se
// oculta si es TODO (razón social/RUC, Términos/Privacidad, redes, WhatsApp).
const FooterWrapper = styled.footer`
	margin-top: 96px;
	background-color: var(--dh-sand-2);
	color: var(--dh-ink);
	@media screen and (max-width: 1024px){
		margin-top: 64px;
	}
`
const FooterInner = styled(Container)`
	padding-top: 56px;
	padding-bottom: 40px;
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 32px;
	@media screen and (max-width: 1024px){
		grid-template-columns: 1fr 1fr;
		padding-top: 40px;
		padding-bottom: 32px;
	}
	@media screen and (max-width: 640px){
		grid-template-columns: 1fr;
		gap: 28px;
	}
`
const BrandCol = styled.div`
	display: flex;
	flex-direction: column;
	gap: 14px;
	align-items: flex-start;
	> a {
		display: inline-flex;
		text-decoration: none;
	}
	p {
		font-size: 14px;
		line-height: 1.55;
		color: var(--dh-ink-2);
		max-width: 300px;
		margin: 0;
	}
	.whatsapp_link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		height: 44px;
		padding: 0 18px;
		border-radius: 22px;
		border: 1.5px solid var(--dh-ink);
		font-size: 14px;
		font-weight: 600;
		color: var(--dh-ink);
		text-decoration: none;
		transition: background-color .15s ease, color .15s ease;
		&:hover, &:focus-visible {
			background-color: var(--dh-ink);
			color: var(--color-text-invert);
		}
		&:focus-visible {
			outline: 2px solid var(--dh-ink);
			outline-offset: 2px;
		}
		svg {
			width: 18px;
			height: 18px;
			fill: currentColor;
		}
	}
	@media screen and (max-width: 1024px){
		grid-column: 1 / -1;
	}
`
const LinksCol = styled.nav`
	display: flex;
	flex-direction: column;
	gap: 10px;
	font-size: 14px;
	h3 {
		font-size: 12px;
		font-weight: 600;
		letter-spacing: .1em;
		text-transform: uppercase;
		color: var(--dh-muted);
		margin: 0 0 4px;
	}
	a {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		width: fit-content;
		color: var(--dh-ink);
		text-decoration: none;
		&:hover, &:focus-visible {
			color: var(--dh-accent);
			text-decoration: underline;
		}
		&:focus-visible {
			outline: 2px solid var(--dh-ink);
			outline-offset: 2px;
		}
		svg {
			width: 18px;
			height: 18px;
			flex-shrink: 0;
		}
	}
	.legal_entity {
		color: var(--dh-muted);
		margin-top: 4px;
	}
`
const BottomBar = styled(Container)`
	padding-top: 20px;
	padding-bottom: 32px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 10px 24px;
	font-size: 13px;
	color: var(--dh-muted);
	.bottom_rule {
		width: 100%;
		border-top: 1px solid var(--dh-line-2);
		margin-bottom: 10px;
	}
	p {
		margin: 0;
	}
	.social {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		a {
			color: var(--dh-muted);
			text-decoration: none;
			&:hover, &:focus-visible {
				color: var(--dh-ink);
				text-decoration: underline;
			}
		}
	}
`

// null cuando no hay número configurado (spec R1.6): los CTA de WhatsApp se ocultan.
const whatsappHref = buildWhatsappUrl('👋 Hola, tengo una consulta sobre un pedido.')

/** Redes configuradas (spec R0.1): sin ninguna, el bloque no se renderiza. */
function socialLinks(): { label: string; url: string }[] {
	const links: { label: string; url: string }[] = []
	if (isConfigured('social.instagram')) links.push({ label: 'Instagram', url: site.social.instagram as string })
	if (isConfigured('social.tiktok')) links.push({ label: 'TikTok', url: site.social.tiktok as string })
	site.social.other.forEach((item) => links.push(item))
	return links
}

/** Línea "[RAZÓN SOCIAL] · RUC [N]" solo con razón social configurada. */
function legalEntityLine(): string | null {
	if (!isConfigured('legal.businessName')) return null
	const ruc = isConfigured('legal.ruc') ? ` · RUC ${site.legal.ruc}` : ''
	return `${site.legal.businessName}${ruc}`
}

function Footer(): JSX.Element {
	const social = socialLinks()
	const legalEntity = legalEntityLine()
	return (
		<FooterWrapper>
			<FooterInner>
				<BrandCol>
					<Link to="/" aria-label="Ir al inicio de devhaus.pe">
						<DevhausLogo markSize={40} />
					</Link>
					<p>Polos y accesorios para developers. Hechos en Perú.</p>
					{whatsappHref && <a className="whatsapp_link" href={whatsappHref} target="_blank" rel="noreferrer">
						<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256" aria-hidden="true"><path d="M200.8 53.9A103.4 103.4 0 0 0 128 24h-1.1a104 104 0 0 0-33.5 202.1a32 32 0 0 0 42.6-30.2V192a16 16 0 0 1 16-16h46.2a31.7 31.7 0 0 0 31.2-24.9a101.5 101.5 0 0 0 2.6-24a102.9 102.9 0 0 0-31.2-73.2Z"></path></svg>
						Escríbenos por WhatsApp
					</a>}
				</BrandCol>
				<LinksCol aria-label="Tienda">
					<h3>Tienda</h3>
					{NAV_LINKS.filter((link) => link.label !== 'Ayuda').map((link) => (
						<Link key={link.label} to={link.to}>{link.label}</Link>
					))}
				</LinksCol>
				<LinksCol aria-label="Ayuda">
					<h3>Ayuda</h3>
					{HELP_LINKS.map((link) => (
						<Link key={link.label} to={link.to}>{link.label}</Link>
					))}
				</LinksCol>
				<LinksCol aria-label="Legal">
					<h3>Legal</h3>
					<Link to="/libro-de-reclamaciones">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h12l4 4v12H4z" /><path d="M8 12h8M8 16h5" /></svg>
						Libro de Reclamaciones
					</Link>
					{isConfigured('legal.termsText') && <Link to="/terminos">Términos y condiciones</Link>}
					{isConfigured('legal.privacyText') && <Link to="/privacidad">Política de privacidad</Link>}
					{legalEntity && <span className="legal_entity">{legalEntity}</span>}
				</LinksCol>
			</FooterInner>
			<BottomBar>
				<div className="bottom_rule" aria-hidden="true"></div>
				<p>© {new Date().getFullYear()} devhaus.pe. Precios en soles (S/), IGV incluido.</p>
				{social.length > 0 &&
					<nav className="social" aria-label="Redes sociales">
						{social.map((item, index) => (
							<span key={item.url} style={{ display: 'contents' }}>
								{index > 0 && <span aria-hidden="true">·</span>}
								<a href={item.url} target="_blank" rel="noreferrer">{item.label}</a>
							</span>
						))}
					</nav>
				}
			</BottomBar>
		</FooterWrapper>
	)
}

export default Footer
