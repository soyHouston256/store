import styled from "styled-components"
import LikeButton from "@/components/LikeButton"
import Product from "../../models/product";
import Card from "../Card";

//function ProductView(product:Product): JSX.Element {
function ProductView(): JSX.Element {
    const base = 'https://firebasestorage.googleapis.com/v0/b/personal-74da9.appspot.com/o/golang.png?alt=media&token=018d5441-64ec-4da3-9b97-3dcc05cf217b';
	const blanco = 'https://firebasestorage.googleapis.com/v0/b/personal-74da9.appspot.com/o/docker_balanco.jpeg?alt=media&token=a2a76d20-cfdd-48b2-b4a0-f780d0f773ee'
	const negro = 'https://firebasestorage.googleapis.com/v0/b/personal-74da9.appspot.com/o/docker_negro.jpeg?alt=media&token=784b726a-6d1f-4606-b485-4c59e327c6cf'
	
    const ProductWrapper = styled.section`
        display: grid;
        grid-template-columns: 3fr 1fr;
        grid-gap: 25px;
        width: var(--screen-desktop);
        margin: 0 auto;
        margin-top: 40px;
		position: relative;
		background-color: #fff;
		z-index: 1200;
    `
	const CardImage = styled.section`
		flex: 1;
		display: flex;
		flex-direction: column;
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
				base-rendering: -moz-crisp-edges;
				base-rendering: -o-crisp-edges;
				base-rendering: -webkit-optimize-contrast;
				base-rendering: crisp-edges;
				-ms-interpolation-mode: nearest-neighbor;
			}
		}
	`
	const CardInfo = styled.section`
		display: flex;
		flex-direction: column;
		gap: 10px;
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
		gap: 10px;
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
	const ProductModal = styled.div`
		position: fixed;
		left:0;
		top:0;
		width:100%;
		height:100%;
		z-index: 1200;
	`
	const OverlayModal = styled.div`
		position: fixed;
		left:0;
		top:0;
		width:100%;
		height:100%;
		z-index: 1000;
		background-color: rgba(0,0,0,0.5);
	`
	const setColorNegro = () => {
		console.log("color");
	}


	return (
		<ProductModal>
			<OverlayModal></OverlayModal>
			<ProductWrapper>
				<CardImage>
					<img src={negro? negro: base} alt="foto aqui" />
					<CardImages>
						<img src={base} alt="" />
						<img src={base} alt="" />
					</CardImages>
				</CardImage>
				<CardInfo>
					<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem dolor possimus corrupti a assumenda magnam quidem sequi labore illo amet, pariatur aliquam, iure sint facere sapiente perferendis? Quas, tempora iste. </p>
					<span>S/ 12.50</span>
					<CardTall>
						<span>XS</span>
						<span>S</span>
						<span>M</span>
						<span>L</span>
						<span>XL</span>
					</CardTall>
					<CardColours>
						<img src={base} alt="" />
						<img src={blanco} alt="" />
						<span onClick={setColorNegro()}>
							<img src={negro} alt=""/>
						</span>
					</CardColours>
				</CardInfo>
			</ProductWrapper>
		</ProductModal>
	)
}

export default ProductView