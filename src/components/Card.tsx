import styled from "styled-components"
import LikeProduct from "@/components/LikeProduct"
import { useNavigate } from "react-router-dom";
import { ProductType } from "@/types/ProductType";
import ProductVisual from "./ProductVisual";


const CardWrapper = styled.section`
	display: flex;
	flex-direction: column;
	background-color: var(--color-neutral);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
	box-shadow: var(--shadow);
	height: 310px;
	position: relative;
	transition: transform .18s ease, box-shadow .18s ease;
	&:hover, &:focus-within {
		transform: translateY(-4px);
		box-shadow: var(--shadow-hover);
	}
	&:hover .card_image_zoom, &:focus-within .card_image_zoom {
		transform: scale(1.06);
	}
	@media screen and (max-width: 1024px){
		height: 270px;
	}
	@media screen and (max-width: 425px){
		height: 250px;
	}
`
const Badge = styled.span`
	position: absolute;
	top: 12px;
	left: 12px;
	z-index: 2;
	display: flex;
	align-items: center;
	gap: 4px;
	background: var(--gradient-brand);
	color: #1a1a1a;
	font-size: 11px;
	font-weight: 700;
	letter-spacing: .02em;
	text-transform: uppercase;
	padding: 5px 10px;
	border-radius: 999px;
	svg {
		width: 11px;
		height: 11px;
		fill: #1a1a1a;
	}
`
const CardImage = styled.button`
	all: unset;
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	width: 100%;
	cursor: pointer;
	box-sizing: border-box;
	.card_image_zoom {
		width: 55%;
		height: 100%;
		display: flex;
		align-items: center;
		margin-top: 1rem;
		transition: transform .25s ease;
		picture {
			width: 100%;
		}
	}
	&:focus-visible {
		outline: 2px solid var(--color-text);
		outline-offset: -4px;
	}
`
const CardInfo = styled.section`
	display: flex;
	flex-direction: column;
	padding: 1.4rem 1.6rem 1.6rem;
	.card_row {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 10px;
	}
	p {
		font-size: var(--font-size-text);
		color: var(--color-text);
		opacity: .7;
		padding-bottom: 5px;
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	span.price {
		font-size: var(--font-size-price);
		font-weight: 700;
		color: var(--color-text);
	}
	@media screen and (max-width: 1024px){
		padding: 1.1rem 1.2rem 1.2rem;
	}
	@media screen and (max-width: 425px){
		padding-top: .6rem;
	}
`
const AddButton = styled.button`
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border-radius: 50%;
	border: none;
	cursor: pointer;
	background: var(--gradient-brand);
	transition: transform .15s ease;
	svg {
		width: 17px;
		height: 17px;
		fill: #1a1a1a;
	}
	&:hover {
		transform: scale(1.08);
	}
	&:focus-visible {
		outline: 2px solid var(--color-text);
		outline-offset: 2px;
	}
`

const POPULAR_LIKES_THRESHOLD = 3

function Card({ product }: { product: ProductType }): JSX.Element {
	const navigate = useNavigate();
	const goToProduct = (id: string) => {
		navigate(`product/${id}`)
	}
	const isPopular = (product.likes ?? 0) >= POPULAR_LIKES_THRESHOLD

	return (
		<CardWrapper>
			{isPopular &&
				<Badge>
					<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256" aria-hidden="true"><path d="M172.5 39.4a8 8 0 0 0-12.9 5.2c-2 17.4-9.1 30.9-19.4 41.5a72.6 72.6 0 0 1-8.7-25.3a8 8 0 0 0-11.9-5.7C88.6 74.9 72 104.4 72 136a56 56 0 0 0 112 0c0-33.7-11.6-73.6-11.5-96.6ZM128 176a40 40 0 0 1-24-72c1.2 9.4 4.7 22.3 15.1 33.5a8 8 0 0 0 11.7-10.9a56.6 56.6 0 0 1-8.5-13c11.5-9.9 20.9-23.1 25-40.2c3.9 20.9 8.7 50.2 8.7 62.6a40 40 0 0 1-28 40Z"></path></svg>
					Popular
				</Badge>
			}
			<LikeProduct product={product} />
			<CardImage type="button" onClick={() => product.id && goToProduct(product.id)} aria-label={`Ver detalle de ${product.name ?? 'producto'}`}>
				<div className="card_image_zoom">
					<ProductVisual product={product} color={product.colors?.[0]} />
				</div>
			</CardImage>
			<CardInfo>
				<p>{product.name}</p>
				<div className="card_row">
					<span className="price">S/ {product.price}</span>
					<AddButton
						type="button"
						aria-label={`Personalizar ${product.name ?? 'producto'}`}
						onClick={() => product.id && goToProduct(product.id)}
					>
						<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256" aria-hidden="true"><path d="M216 116h-84V32a12 12 0 0 0-24 0v84H24a12 12 0 0 0 0 24h84v84a12 12 0 0 0 24 0v-84h84a12 12 0 0 0 0-24Z"></path></svg>
					</AddButton>
				</div>
			</CardInfo>
		</CardWrapper>
	)
}

export default Card
