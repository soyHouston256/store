import styled from "styled-components"

const BenefitsWrapper = styled.section`
	width: var(--screen-desktop);
	margin: 40px auto 0;
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
	@media screen and (max-width: 1024px){
		width: var(--screen-tablet);
		margin-top: 25px;
		gap: 12px;
	}
	@media screen and (max-width: 768px){
		width: var(--screen-phone);
		grid-template-columns: 1fr 1fr;
	}
	@media screen and (max-width: 425px){
		width: calc(100% - 40px);
		margin: 20px 20px 0;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}
`
const BenefitItem = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	background-color: var(--color-neutral);
	border-radius: var(--radius);
	box-shadow: var(--shadow);
	padding: 16px 18px;
	.icon {
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--gradient-brand);
		display: flex;
		align-items: center;
		justify-content: center;
		svg {
			width: 20px;
			height: 20px;
			fill: #1a1a1a;
		}
	}
	.text {
		display: flex;
		flex-direction: column;
		strong {
			font-size: var(--font-size-text-sm);
			color: var(--color-text);
			line-height: 1.3;
		}
		span {
			font-size: 12px;
			color: var(--color-text);
			opacity: .55;
		}
	}
	@media screen and (max-width: 425px){
		padding: 12px 14px;
		.icon {
			width: 34px;
			height: 34px;
			svg { width: 17px; height: 17px; }
		}
		.text strong { font-size: 13px; }
	}
`

const benefits = [
	{
		title: "Envío a todo el Perú",
		description: "Recíbelo en la puerta de tu casa",
		icon: (
			<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256" aria-hidden="true"><path d="M251.8 122.8 226 91.3a6.7 6.7 0 0 0-.7-.7l-40.2-33.5A14 14 0 0 0 176 54h-24a14 14 0 0 0-14 14v10H54a14.3 14.3 0 0 0-13 8.7L23.1 129A14.2 14.2 0 0 0 22 134v34a14 14 0 0 0 14 14h6.4a30 30 0 0 0 59.2 0h52.8a30 30 0 0 0 59.2 0H220a14 14 0 0 0 14-14v-34a14 14 0 0 0-3.2-8.9ZM176 66l35.7 29.7L154 96V66ZM60.3 176a18 18 0 1 1 15.4 8.6 17.8 17.8 0 0 1-15.4-8.6ZM168.3 176a18 18 0 1 1 15.4 8.6 17.8 17.8 0 0 1-15.4-8.6Z"></path></svg>
		)
	},
	{
		title: "Personalización",
		description: "Elige tu diseño desde S/ 15",
		icon: (
			<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256" aria-hidden="true"><path d="M227.3 73.4 182.6 28.7a16 16 0 0 0-22.6 0l-119 119a15.9 15.9 0 0 0-4.7 11.3v44.7A16 16 0 0 0 52.3 220H97a15.9 15.9 0 0 0 11.3-4.7l119-119a16 16 0 0 0 0-22.9ZM52.3 203.7v-40.5l88-88 40.5 40.5-88 88ZM192 104.2 151.8 64l16.2-16.2 40.2 40.2Z"></path></svg>
		)
	},
	{
		title: "Calidad premium",
		description: "Tela suave y estampado durable",
		icon: (
			<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256" aria-hidden="true"><path d="M225.9 102.8 152 74.1V56a16 16 0 0 0-16-16h-16a16 16 0 0 0-16 16v18.1l-73.9 28.7A16.1 16.1 0 0 0 20 117.8v25.9a16 16 0 0 0 20.4 15.4L64 152.3V184a40 40 0 0 0 80 0v-31.7l23.6 6.8a16 16 0 0 0 20.4-15.4v-25.9a16.1 16.1 0 0 0-10.1-15Zm-97.9 105.2a16 16 0 0 1-16-16v-45.2l16-4.6l16 4.6V192a16 16 0 0 1-16 16Z"></path></svg>
		)
	},
	{
		title: "Diseños exclusivos",
		description: "Angular, React, Golang y más",
		icon: (
			<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256" aria-hidden="true"><path d="M69.1 94.1a8.3 8.3 0 0 1 0-11.8l34-34a8.3 8.3 0 0 1 11.8 11.8L83.7 91.2l31.2 31.2a8.3 8.3 0 0 1-11.8 11.8Zm117.8 0-34-34a8.3 8.3 0 1 0-11.8 11.8l31.1 31.3l-31.1 31.2a8.3 8.3 0 0 0 11.8 11.8l34-34a8.3 8.3 0 0 0 0-11.8ZM145 66.5l-32 128a8.3 8.3 0 0 0 6.1 10.1a8 8 0 0 0 2 .3a8.3 8.3 0 0 0 8.1-6.4l32-128a8.3 8.3 0 0 0-16.2-4Z"></path></svg>
		)
	}
]

function Benefits(): JSX.Element {
	return (
		<BenefitsWrapper aria-label="Beneficios de comprar en Estilos">
			{benefits.map((benefit) => (
				<BenefitItem key={benefit.title}>
					<span className="icon">{benefit.icon}</span>
					<span className="text">
						<strong>{benefit.title}</strong>
						<span>{benefit.description}</span>
					</span>
				</BenefitItem>
			))}
		</BenefitsWrapper>
	)
}

export default Benefits
