import styled from "styled-components"
import HeroBgImage from "@/assets/images/hero/hero.png"
import { buildWhatsappUrl } from "@/data/whatsapp"

const HeroWrapper = styled.section`
	position: relative;
	display: flex;
	width: var(--screen-desktop);
	margin: 0 auto;
	background-color: var(--color-neutral);
	border-radius: var(--radius-xl);
	box-shadow: var(--shadow);
	overflow: hidden;
	min-height: 320px;
	&:before, &:after {
		content: "";
		position: absolute;
		border-radius: 50%;
		background: var(--gradient-brand);
		filter: blur(70px);
		opacity: .28;
		pointer-events: none;
	}
	&:before {
		width: 320px;
		height: 320px;
		top: -140px;
		right: -80px;
	}
	&:after {
		width: 220px;
		height: 220px;
		bottom: -120px;
		left: 30%;
		opacity: .18;
	}
	@media screen and (max-width: 1024px){
		width: var(--screen-tablet);
		min-height: 280px;
	}
	@media screen and (max-width: 768px){
		width: var(--screen-phone);
		min-height: auto;
		flex-direction: column;
	}
	@media screen and (max-width: 425px){
		width: calc(100% - 40px);
		margin: 0 20px;
		border-radius: var(--radius);
	}
`
const HeroInfo = styled.div`
	position: relative;
	z-index: 1;
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding: 3.5rem 3rem;
	.kicker {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		width: fit-content;
		font-size: 12px;
		font-weight: 700;
		letter-spacing: .12em;
		text-transform: uppercase;
		color: var(--color-text);
		opacity: .55;
		margin-bottom: 1rem;
		&:before {
			content: "";
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background: var(--gradient-brand);
		}
	}
	h1 {
		font-size: var(--font-size-hero);
		line-height: 1.15;
		font-weight: 800;
		letter-spacing: -.01em;
		color: var(--color-text);
		margin: 0 0 .9rem;
		max-width: 480px;
	}
	.accent {
		background: var(--gradient-brand);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	p {
		font-size: var(--font-size-text);
		color: var(--color-text);
		opacity: .6;
		max-width: 420px;
		margin: 0 0 2rem;
		line-height: 1.5;
	}
	.hero_actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 14px;
	}
	@media screen and (max-width: 1024px){
		padding: 3rem 2rem;
		p {
			margin-bottom: 1.5rem;
		}
	}
	@media screen and (max-width: 768px){
		align-items: center;
		text-align: center;
		padding: 2.5rem 1.75rem 1.5rem;
		h1, p {
			max-width: 100%;
		}
	}
`
const HeroImage = styled.div`
	position: relative;
	z-index: 1;
	flex: 1;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	overflow: hidden;
	.hero_price_tag {
		position: absolute;
		top: 24px;
		left: 24px;
		display: flex;
		align-items: center;
		gap: 8px;
		background-color: var(--color-neutral);
		box-shadow: var(--shadow-hover);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		padding: 8px 16px 8px 10px;
		font-size: 13px;
		font-weight: 600;
		color: var(--color-text);
		.dot {
			width: 22px;
			height: 22px;
			border-radius: 50%;
			background: var(--gradient-brand);
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			svg {
				width: 12px;
				height: 12px;
				fill: #fff;
			}
		}
		strong {
			color: var(--color-text);
		}
	}
	.hero_img_holder {
		position: relative;
		margin-top: 24px;
		img {
			width: 400px;
			display: block;
			image-rendering: -moz-crisp-edges;
			image-rendering: -o-crisp-edges;
			image-rendering: -webkit-optimize-contrast;
			image-rendering: crisp-edges;
			-ms-interpolation-mode: nearest-neighbor;
		}
	}
	@media screen and (max-width: 1024px){
		.hero_img_holder {
			margin-top: 50px;
			img {
				width: 340px;
			}
		}
	}
	@media screen and (max-width: 768px){
		.hero_price_tag {
			top: 16px;
			left: 16px;
		}
		.hero_img_holder {
			margin-top: 0;
			margin-bottom: -20px;
			img {
				width: 320px;
			}
		}
	}
	@media screen and (max-width: 425px){
		.hero_img_holder img {
			width: 260px;
		}
	}
	@media screen and (max-width: 320px){
		.hero_img_holder img {
			width: 230px;
		}
	}
`
const Button = styled.button`
	border: none;
	cursor: pointer;
	background: var(--gradient-brand);
	border-radius: var(--button-radius);
	height: var(--button-height);
	display: flex;
	align-items: center;
	justify-content: center;
	width: fit-content;
	padding: 0 22px;
	transition: transform .15s ease, box-shadow .15s ease;
	&:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-hover);
	}
	&:focus-visible {
		outline: 2px solid var(--color-text);
		outline-offset: 3px;
	}
	svg {
		width: 22px;
		height: 22px;
		fill: #1a1a1a;
		margin-right: 9px;
	}
	span {
		color: #1a1a1a;
		font-weight: 700;
		font-size: var(--font-size-text);
		letter-spacing: .01rem;
		white-space: nowrap;
	}
`
const SecondaryLink = styled.a`
	display: flex;
	align-items: center;
	height: var(--button-height);
	padding: 0 20px;
	border-radius: var(--button-radius);
	border: 1px solid var(--color-border-solid);
	color: var(--color-text);
	font-weight: 600;
	font-size: var(--font-size-text);
	text-decoration: none;
	cursor: pointer;
	transition: border-color .15s ease, opacity .15s ease;
	opacity: .8;
	&:hover, &:focus-visible {
		opacity: 1;
		border-color: var(--color-text);
	}
	&:focus-visible {
		outline: 2px solid var(--color-text);
		outline-offset: 3px;
	}
`

function Hero(): JSX.Element {
	const openWhastapp = () => {
		window.open(buildWhatsappUrl('👋 Hola, quisiera personalizar uno polo.'))
	}
	return (
		<HeroWrapper>
			<HeroInfo>
				<span className="kicker">Diseños para developers</span>
				<h1>Estilo y comodidad <span className="accent">a tu medida</span></h1>
				<p>Polos y accesorios con los stacks que amas: Angular, React, Golang, Java y más. Personaliza el tuyo desde S/ 15.00.</p>
				<div className="hero_actions">
					<Button onClick={openWhastapp} type="button">
						<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256" aria-hidden="true"><path d="M200.8 53.9A103.4 103.4 0 0 0 128 24h-1.1a104 104 0 0 0-33.5 202.1a32 32 0 0 0 42.6-30.2V192a16 16 0 0 1 16-16h46.2a31.7 31.7 0 0 0 31.2-24.9a101.5 101.5 0 0 0 2.6-24a102.9 102.9 0 0 0-31.2-73.2Zm13 93.7a15.9 15.9 0 0 1-15.6 12.4H152a32.1 32.1 0 0 0-32 32v3.9A16 16 0 0 1 98.7 211A88.2 88.2 0 0 1 40 128a88.1 88.1 0 0 1 87.1-88h.9a88.3 88.3 0 0 1 88 87.2a86.8 86.8 0 0 1-2.2 20.4ZM140 76a12 12 0 1 1-12-12a12 12 0 0 1 12 12Zm-46.6 32A12 12 0 1 1 89 91.6a12.1 12.1 0 0 1 4.4 16.4Zm0 40a12 12 0 1 1-16.4-4.4a12.1 12.1 0 0 1 16.4 4.4Zm90-52a12 12 0 1 1-16.4-4.4a12 12 0 0 1 16.4 4.4Z"></path></svg>
						<span>Personalizar por WhatsApp</span>
					</Button>
					<SecondaryLink href="#catalogo">Ver catálogo</SecondaryLink>
				</div>
			</HeroInfo>
			<HeroImage>
				<div className="hero_price_tag">
					<span className="dot">
						<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256" aria-hidden="true"><path d="M223.4 114.2 141.8 32.6a22.1 22.1 0 0 0-15.6-6.5H48a22 22 0 0 0-22 22v78.2a22.1 22.1 0 0 0 6.5 15.6l81.6 81.6a22 22 0 0 0 31.1 0l78.2-78.2a22 22 0 0 0 0-31.1ZM168 96a16 16 0 1 1 16-16a16 16 0 0 1-16 16Z"></path></svg>
					</span>
					Desde <strong>&nbsp;S/ 15</strong>
				</div>
				<div className="hero_img_holder">
					<img src={HeroBgImage} alt="Modelo luciendo un polo personalizado Estilos" />
				</div>
			</HeroImage>
		</HeroWrapper>
	)
}

export default Hero
