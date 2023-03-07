import styled from "styled-components"
import HeroBgImage from "@/assets/images/hero/hero.png"

const HeroWrapper = styled.section`
	display: flex;
	width: var(--screen-desktop);
	margin: 0 auto;
	background-color: var(--color-neutral);
	border-radius: var(--radius);
	box-shadow: var(--shadow);
	height: 240px;
	@media screen and (max-width: 1024px){
		width: var(--screen-tablet);
		height: 220px;
	}
	@media screen and (max-width: 768px){
		width: var(--screen-phone);
		height: auto;
		flex-direction: column;
	}
	@media screen and (max-width: 425px){
		width: calc(100% - 40px);
		margin: 0 20px;
	}
`
const HeroInfo = styled.section`
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	background-color: var(--color-neutral);
	border-radius: var(--radius);
	box-shadow: var(--shadow);
	padding: 3rem;
	h1 {
		font-size: var(--font-size-title);
		font-weight: 700;
		color: var(--color-text);
		margin-bottom: .7rem;
	}
	p {
		font-size: var(--font-size-text);
		opacity: .5;
		color: var(--color-text);
		margin-bottom: 2rem;
	}
	@media screen and (max-width: 1024px){
		padding: 3rem 2rem;
		p {
			margin-bottom: 1.2rem;
		}
	}
	@media screen and (max-width: 768px){
		align-items: center;
	}
`
const HeroImage = styled.section`
	flex: 1;
	display: flex;
	justify-content: center;
	overflow: hidden;
	div {
		position: relative;
		margin-top: 30px;
		img{
			width: 400px;
			image-rendering: -moz-crisp-edges;
			image-rendering: -o-crisp-edges;
			image-rendering: -webkit-optimize-contrast;
			image-rendering: crisp-edges;
			-ms-interpolation-mode: nearest-neighbor;
		}
	}
	@media screen and (max-width: 1024px){
		div {
			margin-top: 50px;
			img {
				width: 340px;
			}
		}
	}
	@media screen and (max-width: 768px){
		div {
			margin-top:  0;
			margin-bottom: -20px;
			img {
				width: 320px;
			}
		}
	}
	@media screen and (max-width: 425px){
		div {
			img {
				width: 280px;
			}
		}
	}
	@media screen and (max-width: 320px){
		div {
			img {
				width: 240px;
			}
		}
	}
`
const Button = styled.button`
	border: none;
	background: linear-gradient(to right, #FF5959, #FFEAA0, #FBC7CD, #654DFF);
	border-radius: var(--button-radius);
	height: var(--button-height);
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: fit-content;
	padding: 0 25px;
	&:before {
		content: "";
		position: absolute;
		border-radius: var(--button-radius);
		inset: 2px;
		width: calc(100% - 4px);
		height: calc(100% - 4px);
		background-color: var(--color-neutral);
	}
	svg {
		width: 24px;
		height: 24px;
		fill: var(--color-text);
		position: relative;
		margin-right: 10px;
	}
	span {
		position: relative;
		color: var(--color-text);
		font-weight: 500;
		font-size: var(--font-size-text);
		letter-spacing: .03rem;
	}
`

function Hero(): JSX.Element {
	return (
		<HeroWrapper>
			<HeroInfo>
				<h1>Estilo y Comodidad</h1>
				<p>Personaliza desde s/ 15.00.</p>
				<Button>
					<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256"><path d="M200.8 53.9A103.4 103.4 0 0 0 128 24h-1.1a104 104 0 0 0-33.5 202.1a32 32 0 0 0 42.6-30.2V192a16 16 0 0 1 16-16h46.2a31.7 31.7 0 0 0 31.2-24.9a101.5 101.5 0 0 0 2.6-24a102.9 102.9 0 0 0-31.2-73.2Zm13 93.7a15.9 15.9 0 0 1-15.6 12.4H152a32.1 32.1 0 0 0-32 32v3.9A16 16 0 0 1 98.7 211A88.2 88.2 0 0 1 40 128a88.1 88.1 0 0 1 87.1-88h.9a88.3 88.3 0 0 1 88 87.2a86.8 86.8 0 0 1-2.2 20.4ZM140 76a12 12 0 1 1-12-12a12 12 0 0 1 12 12Zm-46.6 32A12 12 0 1 1 89 91.6a12.1 12.1 0 0 1 4.4 16.4Zm0 40a12 12 0 1 1-16.4-4.4a12.1 12.1 0 0 1 16.4 4.4Zm90-52a12 12 0 1 1-16.4-4.4a12 12 0 0 1 16.4 4.4Z"></path></svg>
					<span> Personalizar </span>
				</Button>
			</HeroInfo>
			<HeroImage>
				<div>
					<img src={HeroBgImage} />
				</div>
			</HeroImage>
		</HeroWrapper>
	)
}

export default Hero