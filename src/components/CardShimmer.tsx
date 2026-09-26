import styled, { keyframes } from "styled-components"

const pulse = keyframes`
	0%, 100% { opacity: .55; }
	50% { opacity: 1; }
`

// Skeleton con la silueta de Card (imagen 300 + puntos + nombre + meta + precio).
const CardWrapper = styled.article`
	display: flex;
	flex-direction: column;
	overflow: hidden;
	background-color: var(--dh-surface);
	border: 1px solid var(--dh-line);
	border-radius: var(--dh-radius-lg);
	.image {
		height: 300px;
		background: var(--dh-sand);
		animation: ${pulse} ease-in-out 1.1s infinite;
	}
	.info {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 16px 18px 18px;
		span {
			display: block;
			background-color: var(--dh-ink);
			opacity: .07;
			border-radius: 6px;
			height: 12px;
			animation: ${pulse} ease-in-out 1.1s infinite;
		}
		.dots { width: 60px; height: 14px; border-radius: 7px; }
		.name { width: 70%; height: 14px; }
		.meta { width: 45%; }
		.row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-top: 4px;
			.price { width: 56px; height: 18px; }
			.add { width: 44px; height: 44px; border-radius: 22px; }
		}
	}
	@media screen and (max-width: 1024px){
		.image { height: 260px; }
	}
	@media screen and (max-width: 640px){
		.image { height: 180px; }
		.info { padding: 12px; }
	}
`

function CardShimmer(): JSX.Element {
	return (
		<CardWrapper aria-hidden="true">
			<div className="image" />
			<div className="info">
				<span className="dots" />
				<span className="name" />
				<span className="meta" />
				<div className="row">
					<span className="price" />
					<span className="add" />
				</div>
			</div>
		</CardWrapper>
	)
}

export default CardShimmer
