import styled from "styled-components"
import LikeButton from "@/components/LikeButton"
import Product from "../../models/product";
import Card from "../Card";

//function ProductView(product:Product): JSX.Element {
function ProductView(): JSX.Element {
    const image = 'https://firebasestorage.googleapis.com/v0/b/personal-74da9.appspot.com/o/golang.png?alt=media&token=018d5441-64ec-4da3-9b97-3dcc05cf217b';
	const CardWrapper = styled.section`
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background-color: var(--color-neutral);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		flex-direction: column;
		height: 900px;
		position: relative;
	`
    const ProductsGrid = styled.section`
        display: grid;
        grid-template-columns: 3fr 1fr;
        grid-gap: 25px;
        width: var(--screen-desktop);
        margin: 0 auto;
        margin-top: 40px;
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
    const CardTall = styled.section`
        display:flex;
        background-color: var(--color-neutral);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		flex-direction: row;
		height: 90px;
        align-items: center;
        span {
            background-color: var(--color-neutral);
            padding: 10px;
            border: 1px solid black;
            border-radius: var(--radius);
            font-weight: 700;
        }
    `
    const CardColours = styled.section`
        display:flex;
        background-color: var(--color-neutral);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		flex-direction: row;
		height: 100px;
        align-items: center;
        img {
            width: 80px;
        }
    `
    const CardImages = styled.section`
     display:flex;
        background-color: var(--color-neutral);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		flex-direction: row;
		height: 100px;
        align-items: center;
        img {
            width: 80px;
        }
    `
	return (
		<ProductsGrid>
			<CardImage>
                <img src={image} alt="foto aqui" />
            </CardImage>
            <CardInfo>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem dolor possimus corrupti a assumenda magnam quidem sequi labore illo amet, pariatur aliquam, iure sint facere sapiente perferendis? Quas, tempora iste. </p>
				<span>S/ 12.50</span>
            </CardInfo>
            <CardTall>
                <span>XS</span>
                <span>S</span>
                <span>M</span>
                <span>L</span>
                <span>XL</span>
            </CardTall>
            <CardColours>
                <img src={image} alt="" />
                <img src={image} alt="" />
                <img src={image} alt="" />
            </CardColours>
            <CardImages>
                <img src={image} alt="" />
                <img src={image} alt="" />
            </CardImages>
		</ProductsGrid>
	)
}

export default ProductView