import styled from "styled-components"

const CardWrapper = styled.section`
	display: flex;
	flex-direction: column;
	overflow: hidden;
	background-color: var(--color-neutral);
	border-radius: var(--radius);
	box-shadow: var(--shadow);
	flex-direction: column;
	height: 300px;
	position: relative;
	@media screen and (max-width: 1024px){
		height: 240px;
	}
`

const CardImage = styled.section`
	flex: 1;
`

const CardInfo = styled.section`
	display: flex;
	flex-direction: column;
	padding: 2rem;
	p {
		background-color: var(--color-text);
		height: 12px;
		width: 100%;
		opacity: .07;
		margin-bottom: 10px;
		border-radius: var(--radius);
		animation: on_off ease-in-out .7s infinite
	}
	span {
		background-color: var(--color-text);
		height: 12px;
		width: 50px;
		opacity: .07;
		border-radius: var(--radius);
		animation: on_off ease-in-out .7s infinite
	}
	@media screen and (max-width: 1024px){
		p {
			height: 10px;
		}
		span {
			height: 10px;
		}
	}
	@media screen and (max-width: 425px){
		padding-top: 0;
	}
`

function CardShimmer(): JSX.Element {
	return (
		<CardWrapper >
			<CardImage>
			</CardImage>
			<CardInfo>
				<p></p>
				<span></span>
			</CardInfo>
		</CardWrapper>
	)
}

export default CardShimmer