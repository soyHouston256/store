import Logo from "@/components/Logo"
import { buildWhatsappUrl } from "@/data/whatsapp"
import { Link } from "react-router-dom"
import styled from "styled-components"

const FooterWrapper = styled.footer`
	margin-top: 70px;
	border-top: 1px solid var(--color-border);
	background-color: var(--color-neutral-light);
	@media screen and (max-width: 1024px){
		margin-top: 50px;
	}
`
const FooterInner = styled.div`
	width: var(--screen-desktop);
	margin: 0 auto;
	padding: 48px 0 32px;
	display: grid;
	grid-template-columns: 1.4fr 1fr 1fr;
	gap: 32px;
	@media screen and (max-width: 1024px){
		width: var(--screen-tablet);
	}
	@media screen and (max-width: 768px){
		width: var(--screen-phone);
		grid-template-columns: 1fr 1fr;
		padding: 40px 0 24px;
	}
	@media screen and (max-width: 425px){
		width: calc(100% - 40px);
		margin: 0 20px;
		grid-template-columns: 1fr;
		gap: 28px;
	}
`
const BrandCol = styled.div`
	display: flex;
	flex-direction: column;
	gap: 14px;
	a {
		width: fit-content;
	}
	p {
		font-size: var(--font-size-text-sm);
		color: var(--color-text);
		opacity: .6;
		max-width: 320px;
		line-height: 1.6;
		margin: 0;
	}
	.whatsapp_link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		width: fit-content;
		font-size: var(--font-size-text-sm);
		font-weight: 600;
		color: var(--color-text);
		text-decoration: none;
		border-radius: 999px;
		border: 1px solid var(--color-border-solid);
		padding: 8px 16px;
		transition: border-color .15s ease;
		&:hover, &:focus-visible {
			border-color: var(--color-text);
		}
		&:focus-visible {
			outline: 2px solid var(--color-text);
			outline-offset: 2px;
		}
		svg {
			width: 18px;
			height: 18px;
			fill: var(--color-accent);
		}
	}
`
const LinksCol = styled.nav`
	h3 {
		font-size: 13px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: .06em;
		color: var(--color-text);
		opacity: .5;
		margin: 0 0 16px;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	a {
		font-size: var(--font-size-text-sm);
		color: var(--color-text);
		opacity: .75;
		text-decoration: none;
		&:hover, &:focus-visible {
			opacity: 1;
			text-decoration: underline;
		}
		&:focus-visible {
			outline: 2px solid var(--color-text);
			outline-offset: 2px;
		}
	}
`
const BottomBar = styled.div`
	border-top: 1px solid var(--color-border);
	padding: 20px 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 10px;
	width: var(--screen-desktop);
	margin: 0 auto;
	p {
		margin: 0;
		font-size: 12px;
		color: var(--color-text);
		opacity: .5;
	}
	@media screen and (max-width: 1024px){
		width: var(--screen-tablet);
	}
	@media screen and (max-width: 768px){
		width: var(--screen-phone);
	}
	@media screen and (max-width: 425px){
		width: calc(100% - 40px);
		margin: 0 20px;
	}
`

const whatsappHref = buildWhatsappUrl('👋 Hola, tengo una consulta sobre un pedido.')

function Footer(): JSX.Element {
	return (
		<FooterWrapper>
			<FooterInner>
				<BrandCol>
					<Link to="/" aria-label="Ir al inicio de Estilos">
						<Logo />
					</Link>
					<p>Polos y accesorios para developers, con los diseños de las tecnologías que más usas. Hechos en Perú, personalizables desde S/ 15.</p>
					<a className="whatsapp_link" href={whatsappHref} target="_blank" rel="noreferrer">
						<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256" aria-hidden="true"><path d="M200.8 53.9A103.4 103.4 0 0 0 128 24h-1.1a104 104 0 0 0-33.5 202.1a32 32 0 0 0 42.6-30.2V192a16 16 0 0 1 16-16h46.2a31.7 31.7 0 0 0 31.2-24.9a101.5 101.5 0 0 0 2.6-24a102.9 102.9 0 0 0-31.2-73.2Z"></path></svg>
						Escríbenos por WhatsApp
					</a>
				</BrandCol>
				<LinksCol aria-label="Enlaces de la tienda">
					<h3>Tienda</h3>
					<ul>
						<li><a href="#catalogo">Catálogo</a></li>
						<li><a href="#resenas">Reseñas</a></li>
						<li><Link to="/pedido">Sigue tu pedido</Link></li>
					</ul>
				</LinksCol>
				<LinksCol aria-label="Contacto">
					<h3>Contacto</h3>
					<ul>
						<li><a href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp</a></li>
						<li><a href="#catalogo">Personalizar producto</a></li>
					</ul>
				</LinksCol>
			</FooterInner>
			<BottomBar>
				<p>© {new Date().getFullYear()} Estilos. Precios en soles (S/).</p>
				<p>Hecho con cariño para la comunidad developer 💛</p>
			</BottomBar>
		</FooterWrapper>
	)
}

export default Footer
