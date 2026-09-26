import styled from "styled-components"
import { useSelector } from "react-redux"
import Container from "@/components/layout/Container"
import { buildWhatsappUrl } from "@/data/whatsapp"
import { site } from "@/config/site"
import { RootState } from "@/store"
import { useCatalogStatus } from "@/hooks/useProductsList"

// Hero (spec 02 §1 / R3.3, canvas Home.dc.html): tarjeta blanca radio 28,
// línea mono, h1 64/800 con "a tu medida" en --dh-accent (sin degradado),
// párrafo 18 con customization.fromPrice, CTAs "Ver catálogo" y WhatsApp (R1.6),
// panel --dh-sand con 3 mockups procedurales en abanico (hasta tener fotos) y
// etiqueta "Polos S/ {mín} · Personaliza desde S/ {fromPrice}" solo con data.
const HeroSection = styled(Container)`
	padding-top: 48px;
	@media screen and (max-width: 1024px){
		padding-top: 32px;
	}
	@media screen and (max-width: 640px){
		padding-top: 20px;
	}
`
const HeroCard = styled.div`
	display: flex;
	min-height: 460px;
	border-radius: var(--dh-radius-xl);
	background: var(--dh-surface);
	border: 1px solid var(--dh-line);
	overflow: hidden;
	@media screen and (max-width: 1024px){
		flex-direction: column;
		min-height: 0;
	}
	@media screen and (max-width: 640px){
		border-radius: var(--dh-radius-lg);
	}
`
const HeroCopy = styled.div`
	flex: 0 0 52%;
	max-width: 600px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 22px;
	padding: 56px 40px 56px 64px;
	box-sizing: border-box;
	.mono {
		font-family: var(--dh-font-mono);
		font-size: 13px;
		font-weight: 500;
		color: var(--dh-muted);
	}
	h1 {
		margin: 0;
		font-family: var(--dh-font-display);
		font-size: var(--dh-text-hero);
		line-height: 1.02;
		font-weight: 800;
		letter-spacing: -0.03em;
		color: var(--dh-ink);
		.accent {
			color: var(--dh-accent);
		}
	}
	p {
		margin: 0;
		font-size: 18px;
		line-height: 1.55;
		color: var(--dh-ink-2);
		max-width: 470px;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		padding-top: 6px;
	}
	@media screen and (max-width: 1024px){
		flex-basis: auto;
		max-width: none;
		padding: 40px 32px;
		gap: 18px;
	}
	@media screen and (max-width: 640px){
		padding: 28px 20px;
		h1 {
			font-size: 40px;
		}
		p {
			font-size: 16px;
		}
	}
`
// Ancla nativa: conserva los `?` params del catálogo y el navegador desplaza a #catalogo.
const PrimaryCta = styled.a`
	height: 52px;
	padding: 0 26px;
	border-radius: 26px;
	background: var(--dh-ink);
	color: var(--color-text-invert);
	display: inline-flex;
	align-items: center;
	font-weight: 600;
	font-size: 16px;
	text-decoration: none;
	white-space: nowrap;
	transition: opacity .15s ease;
	&:hover {
		opacity: .9;
	}
	&:focus-visible {
		outline: 2px solid var(--dh-ink);
		outline-offset: 3px;
	}
`
const SecondaryCta = styled.a`
	height: 52px;
	padding: 0 24px;
	border-radius: 26px;
	border: 1.5px solid var(--dh-ink);
	color: var(--dh-ink);
	display: inline-flex;
	align-items: center;
	gap: 10px;
	font-weight: 600;
	font-size: 16px;
	text-decoration: none;
	white-space: nowrap;
	box-sizing: border-box;
	transition: background .15s ease, color .15s ease;
	svg {
		width: 18px;
		height: 18px;
		stroke: currentColor;
	}
	&:hover {
		background: var(--dh-ink);
		color: var(--color-text-invert);
	}
	&:focus-visible {
		outline: 2px solid var(--dh-ink);
		outline-offset: 3px;
	}
`
const HeroArt = styled.div`
	flex: 1 1 auto;
	position: relative;
	background: var(--dh-sand);
	min-height: 460px;
	overflow: hidden;
	.shirt {
		position: absolute;
		display: block;
	}
	.shirt_a {
		left: 6%;
		top: 15%;
		width: 40%;
		transform: rotate(-8deg);
	}
	.shirt_b {
		left: 30%;
		top: 8%;
		width: 48%;
		z-index: 1;
	}
	.shirt_c {
		left: 61%;
		top: 26%;
		width: 39%;
		transform: rotate(7deg);
	}
	.tag {
		position: absolute;
		right: 32px;
		top: 28px;
		z-index: 2;
		padding: 10px 16px;
		border-radius: 20px;
		background: var(--dh-surface);
		border: 1px solid var(--dh-line);
		color: var(--dh-ink);
		font-size: 14px;
		font-weight: 600;
		white-space: nowrap;
	}
	@media screen and (max-width: 1024px){
		min-height: 340px;
	}
	@media screen and (max-width: 640px){
		min-height: 240px;
		.tag {
			right: 16px;
			top: 16px;
			font-size: 13px;
			padding: 8px 12px;
		}
	}
`

const SHIRT_PATH = 'M62 18 L80 10 Q100 24 120 10 L138 18 L182 46 L164 80 L146 70 L146 190 L54 190 L54 70 L36 80 L18 46 Z'

function Hero(): JSX.Element {
	// null sin número configurado (spec R1.6): el CTA de WhatsApp no se renderiza.
	const whatsappHref = buildWhatsappUrl('👋 Hola, quisiera personalizar un polo.')
	const { loading, error } = useCatalogStatus()
	const products = useSelector((state: RootState) => state.products.products)
	const poloPrices = products
		.filter((product) => (product.type ?? 'polo') === 'polo' && typeof product.price === 'number')
		.map((product) => product.price as number)
	const minPoloPrice = poloPrices.length ? Math.min(...poloPrices) : null
	const showTag = !loading && !error && minPoloPrice !== null
	const fromPrice = site.customization.fromPrice

	return (
		<HeroSection as="section" aria-labelledby="hero-title">
			<HeroCard>
				<HeroCopy>
					<span className="mono" aria-hidden="true">$ git checkout -b tu-estilo</span>
					<h1 id="hero-title">Estilo y comodidad <span className="accent">a tu medida</span></h1>
					<p>Polos, mousepads y tazas con los stacks que amas: Angular, React, Go, Java y más. Personaliza el tuyo desde S/ {fromPrice}.</p>
					<div className="actions">
						<PrimaryCta href="#catalogo">Ver catálogo</PrimaryCta>
						{whatsappHref && (
							<SecondaryCta href={whatsappHref} target="_blank" rel="noreferrer">
								<svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20l1.2-4.2L15.8 5.2a2 2 0 0 1 2.9 0l.1.1a2 2 0 0 1 0 2.9L8.2 18.8z" /></svg>
								Personalizar por WhatsApp
							</SecondaryCta>
						)}
					</div>
				</HeroCopy>
				<HeroArt aria-hidden="true">
					<svg className="shirt shirt_a" viewBox="0 0 200 200"><path d={SHIRT_PATH} fill="#E9B949" /><text x="100" y="98" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" fill="#1B1A17">console.log(</text><text x="100" y="114" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" fill="#1B1A17">"hola")</text></svg>
					<svg className="shirt shirt_b" viewBox="0 0 200 200"><path d={SHIRT_PATH} fill="#1B1A17" /><text x="100" y="92" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="700" fill="#7FA894">git commit -m</text><text x="100" y="110" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill="#E9B949">"ya funciona"</text></svg>
					<svg className="shirt shirt_c" viewBox="0 0 200 200"><path d={SHIRT_PATH} fill="#8C8A86" /><text x="100" y="100" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="700" fill="#FAF6F1">&lt;/&gt;</text></svg>
					{showTag && <span className="tag">Polos S/ {minPoloPrice} · Personaliza desde S/ {fromPrice}</span>}
				</HeroArt>
			</HeroCard>
		</HeroSection>
	)
}

export default Hero
