import { useNavigate, useParams, useRoutes } from "react-router-dom";
import styled from "styled-components"
import CardBgImage from "@/assets/images/img/node.png"
import LikeButton from "./LikeButton";
import useProductsById from "@/hooks/useProductById";

const ProductModal = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100vh;
`

const ProductModalWrapper = styled.section`
    width: 100%;
    height: 100%;
`

const ModalOverlay = styled.div`
    background-color: rgba(0,0,0,.7);
    width: 100%;
    height: 100vh;
`

const ProductModalBody = styled.div`
    background-color: var(--color-neutral);
    width: var(--screen-desktop);
    min-height: 550px;
    border-radius: 16px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 5rem 7rem;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 1fr 1fr;
    /* grid-auto-rows: min-content; */
    grid-gap: 50px;
    /* align-content: center; */
    .product_image_wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        .product_image {
            image-rendering: -moz-crisp-edges;
            image-rendering: -o-crisp-edges;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
            -ms-interpolation-mode: nearest-neighbor;
            max-width: 400px;
            width: 400px;
        }
    }
    .product_detail {
        background-color: var(--color-accent-light);
        padding: 25px;
        box-sizing: border-box;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        height: 100%;
        .product_detail_wrapper {
            flex: 1;
            .title {
                position: relative;
                .title_wrapper {
                    h1 {
                        font-size: 20px;
                        margin-bottom: 10px;
                        color: var(--color-text);
                        opacity: .7;
                    }
                    h2 {
                        font-weight: 700;
                        font-size: 24px;
                        margin-bottom: 20px;
                        color: var(--color-text)
                    }
                }
                button {
                    right: 0;
                    top: 0;
                }
            }
            section {
                margin-bottom: 20px;
                strong {
                    text-transform: uppercase;
                    letter-spacing: .03rem;
                    font-weight: 600;
                    font-size: 12px;
                    display: block;
                    margin-bottom: 8px;
                    opacity: .7;
                    color: var(--color-text)
                }
                &.colors {
                    .colors_wrapper {
                        display: flex;
                        gap: 10px;
                        margin-left: -2px;
                        span {
                            border-radius: 50%;
                            width: 24px;
                            height: 24px;
                            background-color: gold;
                        }
                    }
                }
                &.sizes {
                    .sizes_wrapper {
                        display: flex;
                        gap: 10px;
                        span {
                            border-radius: 4px;
                            width: 32px;
                            height: 32px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            border: 1px solid rgba(0,0,0,.1);
                            font-size: 12px;
                            font-weight: 600;
                            background-color: var(--color-surface);
                            color: var(--color-text)
                        }
                    }
                }
            }
        }
    }
`

const Button = styled.button`
    border: none;
    background-color: var(--color-accent);
    border-radius: var(--button-radius);
    height: var(--button-height);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0 25px;
    margin-left: -2px;
    svg {
        width: 24px;
        height: 24px;
        fill: var(--color-text-invert);
        position: relative;
        margin-right: 10px;
    }
    span {
        position: relative;
        color: var(--color-text-invert);
        font-weight: 500;
        font-size: var(--font-size-text);
        letter-spacing: .01rem;
    }
`

function Product(): JSX.Element {
    const navigate = useNavigate();
    const { id } = useParams()
    const { product } = useProductsById(id!)
   
    return (
        <ProductModal>
            <ProductModalWrapper>
                <ModalOverlay onClick={() => navigate(-1)} />
                { product &&
                <ProductModalBody >
                    <div className="product_image_wrapper">
                        <img className="product_image" src={product.image} />
                    </div>
                    <div className="product_detail">
                        <div className="product_detail_wrapper">
                            <div className="title">
                                <div className="title_wrapper">
                                    <h1>{ product.name }</h1>
                                    <h2>S/ {product.price}</h2>
                                </div>
                                <LikeButton />
                            </div>
                            <section className="colors">
                                <strong>colores</strong>
                                <div className="colors_wrapper">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </section>
                            <section className="sizes">
                                <strong>tallas</strong>
                                <div className="sizes_wrapper">
                                    <span>XS</span>
                                    <span>S</span>
                                    <span>M</span>
                                    <span>L</span>
                                    <span>XL</span>
                                </div>
                            </section>
                        </div>
                        <Button>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"> <path d="M8.8125 20.25C8.8125 20.5096 8.73552 20.7633 8.5913 20.9792C8.44708 21.195 8.2421 21.3633 8.00227 21.4626C7.76244 21.5619 7.49854 21.5879 7.24394 21.5373C6.98934 21.4866 6.75548 21.3616 6.57192 21.1781C6.38837 20.9945 6.26336 20.7607 6.21272 20.5061C6.16208 20.2515 6.18807 19.9876 6.28741 19.7477C6.38675 19.5079 6.55497 19.3029 6.77081 19.1587C6.98665 19.0145 7.24041 18.9375 7.5 18.9375C7.8481 18.9375 8.18194 19.0758 8.42808 19.3219C8.67422 19.5681 8.8125 19.9019 8.8125 20.25ZM17.25 18.9375C16.9904 18.9375 16.7367 19.0145 16.5208 19.1587C16.305 19.3029 16.1367 19.5079 16.0374 19.7477C15.9381 19.9876 15.9121 20.2515 15.9627 20.5061C16.0134 20.7607 16.1384 20.9945 16.3219 21.1781C16.5055 21.3616 16.7393 21.4866 16.9939 21.5373C17.2485 21.5879 17.5124 21.5619 17.7523 21.4626C17.9921 21.3633 18.1971 21.195 18.3413 20.9792C18.4855 20.7633 18.5625 20.5096 18.5625 20.25C18.5625 19.9019 18.4242 19.5681 18.1781 19.3219C17.9319 19.0758 17.5981 18.9375 17.25 18.9375ZM21.3281 6.9L18.8531 15.5625C18.7278 15.9934 18.4666 16.3722 18.1084 16.6425C17.7503 16.9128 17.3143 17.0601 16.8656 17.0625H7.88437C7.43566 17.0601 6.99972 16.9128 6.64156 16.6425C6.2834 16.3722 6.02219 15.9934 5.89688 15.5625L3.42188 6.91875V6.89062L2.50313 3.70312C2.49442 3.66263 2.47187 3.62644 2.43936 3.60077C2.40685 3.57511 2.36641 3.56157 2.325 3.5625H0.75C0.600816 3.5625 0.457742 3.50324 0.352252 3.39775C0.246763 3.29226 0.1875 3.14918 0.1875 3C0.1875 2.85082 0.246763 2.70774 0.352252 2.60225C0.457742 2.49676 0.600816 2.4375 0.75 2.4375H2.325C2.61101 2.43851 2.88899 2.53227 3.11719 2.70469C3.34539 2.87711 3.51152 3.11889 3.59062 3.39375L4.3875 6.1875H20.7844C20.8717 6.1875 20.9578 6.20783 21.0359 6.24688C21.114 6.28594 21.182 6.34264 21.2344 6.4125C21.2863 6.48117 21.3217 6.56083 21.3379 6.64535C21.3542 6.72986 21.3508 6.81698 21.3281 6.9ZM20.0438 7.3125H4.70625L6.98438 15.2531C7.03947 15.4496 7.15717 15.6227 7.3196 15.7463C7.48203 15.8698 7.68032 15.9369 7.88437 15.9375H16.8656C17.0697 15.9369 17.268 15.8698 17.4304 15.7463C17.5928 15.6227 17.7105 15.4496 17.7656 15.2531L20.0438 7.3125Z" /> <path d="M13 11H14.5C14.6326 11 14.7598 11.0527 14.8536 11.1464C14.9473 11.2402 15 11.3674 15 11.5C15 11.6326 14.9473 11.7598 14.8536 11.8536C14.7598 11.9473 14.6326 12 14.5 12H13V13.5C13 13.6326 12.9473 13.7598 12.8536 13.8536C12.7598 13.9473 12.6326 14 12.5 14C12.3674 14 12.2402 13.9473 12.1464 13.8536C12.0527 13.7598 12 13.6326 12 13.5V12H10.5C10.3674 12 10.2402 11.9473 10.1464 11.8536C10.0527 11.7598 10 11.6326 10 11.5C10 11.3674 10.0527 11.2402 10.1464 11.1464C10.2402 11.0527 10.3674 11 10.5 11H12V9.5C12 9.36739 12.0527 9.24022 12.1464 9.14645C12.2402 9.05268 12.3674 9 12.5 9C12.6326 9 12.7598 9.05268 12.8536 9.14645C12.9473 9.24022 13 9.36739 13 9.5V11Z" /> </svg>
                            <span> Agregar a carrito </span>
                        </Button>
                    </div>
                </ProductModalBody>
                }
            </ProductModalWrapper>
        </ProductModal>
    )
}

export default Product