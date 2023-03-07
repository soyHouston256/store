import Navbar from '@/components/Navbar'
import styled from 'styled-components'
import HeroBgImage from "@/assets/images/hero/hero.png"
import { useReadLocalStorage } from 'usehooks-ts'

const DoneWrapper = styled.section`
    min-height: 480px;
    background-color: var(--color-neutral);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 0 25px;
    box-sizing: border-box;
    width: var(--screen-desktop);
    margin: 0 auto;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
    .done_content {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        width: 100%;
        height: 100%;
        flex-direction: column;
        gap: 5px;
        color: var(--color-text);
        h1 {
            font-size: 16px;
            font-weight: 700;
            color: var(--color-text);
            margin-top: 10px;
        }
        p {
            opacity: .5;
            font-size: 15px;
            margin-bottom: 10px;
            text-align: center;
            width: 100%;
            max-width: 400px;
            line-height: 1.3;
            margin-bottom: 4rem;
        }
        svg {
            fill: var(--color-accent);
            width: 36px;
            margin-left: -8px;
        }
    }
    @media screen and (max-width: 1024px){
        width: var(--screen-tablet);
	}
    @media screen and (max-width: 768px){
        width: var(--screen-phone);
	}
     @media screen and (max-width: 425px){
        width: calc(100% - 40px);
        margin: 0 20px;
        min-height: calc(100vh - 80px);
        .done_content {
            p {
                margin-bottom: 15rem;
            }
        }
	}
`

const DoneImage = styled.section`
	flex: 1;
	display: flex;
	justify-content: center;
	overflow: hidden;
    margin-bottom: -50px;
	div {
		position: relative;
		img{
			width: 400px;
			image-rendering: -moz-crisp-edges;
			image-rendering: -o-crisp-edges;
			image-rendering: -webkit-optimize-contrast;
			image-rendering: crisp-edges;
			-ms-interpolation-mode: nearest-neighbor;
		}
	}
    @media screen and (max-width: 768px){
        div {
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

function Done(): JSX.Element {
    const orderId = useReadLocalStorage<string>('order')
    return (
        <div>
            <Navbar />
            <DoneWrapper>
                <div className="done_content">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 256 256"><path  d="m221.4 69.3l-16-32A6 6 0 0 0 200 34H56a6 6 0 0 0-5.4 3.3l-16 32A6.3 6.3 0 0 0 34 72v136a14 14 0 0 0 14 14h160a14 14 0 0 0 14-14V72a6.3 6.3 0 0 0-.6-2.7ZM59.7 46h136.6l10 20H49.7ZM208 210H48a2 2 0 0 1-2-2V78h164v130a2 2 0 0 1-2 2Zm-41.8-64.2a6.1 6.1 0 0 1 0 8.5l-34 33.9a5.8 5.8 0 0 1-8.4 0l-34-33.9a6 6 0 0 1 8.5-8.5l23.7 23.7V104a6 6 0 0 1 12 0v65.5l23.7-23.7a6.1 6.1 0 0 1 8.5 0Z" /></svg>
                    <h1>Pedido <strong>"{orderId}"</strong> registrado</h1>
                    <p>Tu pedido fue registrado correctamente estaremos en contacto por Whastapp.</p>
                    <DoneImage>
                        <div>
                            <img src={HeroBgImage} />
                        </div>
                    </DoneImage>
                </div>
            </DoneWrapper>
        </div>
    )
}

export default Done