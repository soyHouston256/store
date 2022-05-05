import styled from "styled-components"
import CardBgImage from "@/assets/images/img/node.png"

function Card () {

	const CardWrapper = styled.section`
		display: flex;
		flex-direction: column;
		overflow: hidden;
		width: 300px;
		margin: 0 auto;
		background-color: var(--color-neutral);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		flex-direction: column;
		height: 300px;
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
				width:100%;
				height: 100%;
				max-width: 100%;
				vertical-align: middle;
				image-rendering: -moz-crisp-edges;
				image-rendering: -o-crisp-edges;
				image-rendering: -webkit-optimize-contrast;
				image-rendering: crisp-edges;
				-ms-interpolation-mode: nearest-neighbor;
			}
		}
	`
	const CardInfo = styled.section`
		display: flex;
		flex-direction: column;
		padding: 1rem;
		h2 {
			font-size: var(--font-size-text);
			font-weight: 700;
			color: var(--color-text);
			opacity:.7;
			padding-bottom: 5px;
		}
		span {
			font-size: var--font-size-price);
			font-weight: 700;
			color: var(--color-text);
		}
	`
	return (
		<CardWrapper>
			<CardImage>
				<div>
					<img src={CardBgImage} />
				</div>
			</CardImage>
			{<CardInfo>
				<h2>POLO NODE.JS</h2>
				<span>S/ 30.00</span>
			</CardInfo>}
		</CardWrapper>
	)
}

export default Card