import styled from "styled-components"
import LikeProduct from "@/components/LikeProduct"
import { useNavigate } from "react-router-dom";
import { ProductType } from "@/types/ProductType";
import TShirt from "./TShirt";


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
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	width: 100%;
	background-color: var(--color-neutral);
	div {
		width: 60%;
		height: auto;
		margin-top: 1rem;
		picture {
			width: 100%;
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
	@media screen and (max-width: 1024px){
		padding: 1.2rem;
	}
	@media screen and (max-width: 425px){
		padding-top: 0;
	}
`

function Card({ product }: { product: ProductType }): JSX.Element {
	const navigate = useNavigate();
	const goToProduct = (id: string) => {
		navigate(`product/${id}`)
	}
	
	return (
		<CardWrapper >
			<LikeProduct product={product} />
			<CardImage onClick={() => goToProduct(product.id!)}>
				<div>
					<TShirt image={product.image!} color={product.colors![0]!} />
				</div>
			</CardImage>
			<CardInfo>
				<p>{ product .name}</p>
				<span>S/ {product.price}</span>
			</CardInfo>
		</CardWrapper>
	)
}

export default Card