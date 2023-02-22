import styled from "styled-components"
import CardBgImage from "@/assets/images/img/node.png"
import LikeButton from "@/components/LikeButton"
import { useNavigate } from "react-router-dom";

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
`
const CardImage = styled.section`
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	width: 100%;
	background-color: var(--color-neutral);
	div {
		width:80%;
		height: 80%;
		img{
			padding-top: 1rem;
			object-fit: contain;
			width:100%;
			height: 100%;
			max-width: 100%;
			vertical-align: middle;
			image-rendering: -moz-crisp-edges;
			image-rendering: -o-crisp-edges;
			image-rendering: -webkit-optimize-contrast;
			image-rendering: crisp-edges;
			-ms-interpolation-mode: nearest-neighbor;
			cursor: pointer;
		}
	}
`
const CardInfo = styled.section`
	display: flex;
	flex-direction: column;
	padding: 2rem;
	p {
		font-size: var(--font-size-text);
		color: var(--color-text);
		opacity:.7;
		padding-bottom: 5px;
	}
	span {
		font-size: var(--font-size-price);
		font-weight: 700;
		color: var(--color-text);
	}
`

function Card(): JSX.Element {
    const navigate = useNavigate();

	const goToProduct = () => {
		navigate('modal')
	}

	return (
		<CardWrapper >
			<LikeButton />
			<CardImage onClick={goToProduct}>
				<div>
					<img src={CardBgImage} />
				</div>
			</CardImage>
			<CardInfo>
				<p>Polo Node.js</p>
				<span>S/ 30.00</span>
			</CardInfo>
		</CardWrapper>
	)
}

export default Card