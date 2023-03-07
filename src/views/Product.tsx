import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components"
import LikeButton from "../components/LikeButton";
import useProductsById from "@/hooks/useProductById";
import { ProductCartActionType, ProductCartType } from "@/types/ProductType";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { addToCart } from "@/store/slices/products/cart";
import { useDispatch } from "react-redux";
import TShirt from "@/components/TShirt";
import LikeProduct from "@/components/LikeProduct";
import { ID } from "@/utils/helpers";

const ProductModal = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100vh;
    z-index: 10;
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
    max-height: calc(100vh - 40px);
    overflow: auto;
    background-color: var(--color-neutral);
    width: var(--screen-desktop);
    min-height: 550px;
    border-radius: var(--radius);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 5rem 7rem;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 50px;
    .product_image_wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .product_detail {
        background-color: var(--color-accent-light);
        padding: 25px;
        box-sizing: border-box;
        border-radius: var(--radius);
        display: flex;
        flex-direction: column;
        height: 100%;
        .product_detail_wrapper {
            flex: 1;
            .title {
                position: relative;
                .title_wrapper {
                    h1 {
                        font-size: var(--font-size-title_sm);
                        margin-bottom: 10px;
                        color: var(--color-text);
                        opacity: .7;
                    }
                    h2 {
                        font-weight: 700;
                        font-size: var(--font-size-price_xl);
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
                    opacity: .5;
                    color: var(--color-text);
                    position: relative;
                    width: fit-content;
                    .error {
                        display: none;
                        position: absolute;
                        left: calc(100% + 5px);
                        top: -2px;
                    }
                    &.required {
                        opacity: 1;
                        .error {
                            display: flex;
                            align-items: center;
                            gap: 2px;
                            color: var(--color-error);
                        }
                    }
                }
                &.colors {
                    .colors_wrapper {
                        display: flex;
                        gap: 10px;
                        margin-left: -2px;
                        span {
                            border-radius: 50%;
                            width: 28px;
                            height: 28px;
                            border: 1px solid var(--color-border);
                            box-sizing: border-box;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            svg {
                                display: none;
                                filter: invert(1) brightness(2) grayscale(1);
                            }
                            &:hover {
                                border-color: var(--color-border-dark);
                            }
                            &.selected {
                                svg {
                                    display: block;
                                }
                            }
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
                            border: 1px solid var(--color-border);
                            font-size: 13px;
                            font-weight: 600;
                            background-color: var(--color-surface);
                            color: var(--color-text);
                            cursor: pointer;
                            box-sizing: border-box;
                            &:hover {
                                border-color: var(--color-border-dark);
                            }
                            &.selected {
                                border-color: var(--color-accent);
                            }
                            
                        }
                    }
                }
                &.quantity {
                    .quantity_wrapper {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        p {
                            font-weight: 600;
                            font-size: 16px;
                            color: var(--color-text)
                        }
                        span {
                            border-radius: 50%;
                            width: 32px;
                            height: 32px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            border: 1px solid var(--color-border);
                            font-size: 16px;
                            font-weight: 600;
                            background-color: var(--color-surface);
                            color: var(--color-text);
                            cursor: pointer;
                            user-select: none;
                            &:hover {
                                border-color: var(--color-border-dark);
                            }
                        }
                    }
                }
            }
        }
    }
    @media screen and (max-width: 1024px){
		width: var(--screen-tablet);
        padding: 3rem;
        min-height: 400px;
        grid-gap: 25px;
        .product_detail {
            .product_detail_wrapper {
                .title {
                    .title_wrapper h1{
                        margin-bottom: 5px;
                    }
                }
            }
        }
	}
    @media screen and (max-width: 768px){
		width: var(--screen-phone);
        grid-template-columns: 1fr;
        padding: 2rem 1.2rem;
        padding-bottom: 1.2rem;
	}
    @media screen and (max-width: 425px){
		width: 100%;
        top: inherit;
        left: inherit;
        bottom: 0;
        transform: translate(0);
        border-radius: var(--radius) var(--radius) 0 0;
        .product_detail {
            padding: 20px;
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
    const [quantity, setQuantity] = useState(1)
    const [trigger, setTrigger] = useState(false)
    const [color, setColor] = useState<string>()
    const [size, setSize] = useState<string>()
    const navigate = useNavigate();
    const { id } = useParams()
    const { product } = useProductsById(id!)
    const dispatch: Dispatch<any> = useDispatch()
    const setProduct = useCallback(
        (product: ProductCartType) => dispatch(addToCart({ type: ProductCartActionType.SUM, product})),
        [dispatch]
    )

    useEffect(() => {
        setColor(product?.colors![0])
   }, [product])

    const goBack = () => {
        navigate(-1)
    }

    const productAddToCart = () => {
        setTrigger(true)
        if (size) {
            setProduct({ ...product!, quantity, size, color, _id: ID() })
            goBack()
        }
    }

    const increment = () => {
        setQuantity(quantity + 1)
    }
    const decrement = () => {
        if (quantity > 1) setQuantity(quantity - 1)
    }

    return (
        <ProductModal>
            <ProductModalWrapper>
                <ModalOverlay onClick={goBack} />
                { product &&
                <ProductModalBody >
                    <div className="product_image_wrapper">
                        <TShirt image={product.image!} color={color!}/>
                    </div>
                    <div className="product_detail">
                        <div className="product_detail_wrapper">
                            <div className="title">
                                <div className="title_wrapper">
                                    <h1>{ product.name }</h1>
                                    <h2>S/ {product.price}</h2>
                                </div>
                                <LikeProduct product={product}/>
                            </div>
                            <section className="colors">
                                <strong>colores</strong>
                                <div className="colors_wrapper">
                                    {product.colors!.map(c =>
                                        <span className={c === color ? 'selected' : ''} onClick={() => setColor(c)} style={{ backgroundColor: c }} key={c}>
                                            <svg style={{ color: c }} width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="M104 196a12.2 12.2 0 0 1-8.5-3.5l-56-56a12 12 0 0 1 17-17L104 167L207.5 63.5a12 12 0 0 1 17 17l-112 112a12.2 12.2 0 0 1-8.5 3.5Z" /></svg>
                                        </span>
                                    )}
                                </div>
                            </section>
                            <section className="sizes">
                                <strong className={!size && trigger ? 'required' : ''} >
                                        tallas
                                        <div className="error">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256"><path fill="currentColor" d="M128 20a108 108 0 1 0 108 108A108.1 108.1 0 0 0 128 20Zm0 192a84 84 0 1 1 84-84a84.1 84.1 0 0 1-84 84Zm-12-80V80a12 12 0 0 1 24 0v52a12 12 0 0 1-24 0Zm28 40a16 16 0 1 1-16-16a16 16 0 0 1 16 16Z" /></svg>
                                            requerido
                                        </div>
                                </strong>
                                <div className="sizes_wrapper">
                                   { product.sizes!.map(s => <span className={s === size ? 'selected' : ''} onClick={() => setSize(s)} key={s}>{ s }</span>) }
                                </div>
                            </section>
                            <section className="quantity">
                                <strong>Cantidad</strong>
                                <div className="quantity_wrapper">
                                    <span onClick={decrement}>-</span>
                                    <p>{quantity}</p>
                                    <span onClick={increment}>+</span>
                                </div>
                            </section>
                        </div>
                            <Button onClick={productAddToCart}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
                                <path d="M12 27C12 27.3956 11.8827 27.7822 11.6629 28.1111C11.4432 28.44 11.1308 28.6964 10.7654 28.8478C10.3999 28.9991 9.99778 29.0387 9.60982 28.9616C9.22186 28.8844 8.86549 28.6939 8.58579 28.4142C8.30608 28.1345 8.1156 27.7781 8.03843 27.3902C7.96126 27.0022 8.00087 26.6001 8.15224 26.2346C8.30362 25.8692 8.55996 25.5568 8.88886 25.3371C9.21776 25.1173 9.60444 25 10 25C10.5304 25 11.0391 25.2107 11.4142 25.5858C11.7893 25.9609 12 26.4696 12 27ZM23 25C22.6044 25 22.2178 25.1173 21.8889 25.3371C21.56 25.5568 21.3036 25.8692 21.1522 26.2346C21.0009 26.6001 20.9613 27.0022 21.0384 27.3902C21.1156 27.7781 21.3061 28.1345 21.5858 28.4142C21.8655 28.6939 22.2219 28.8844 22.6098 28.9616C22.9978 29.0387 23.3999 28.9991 23.7654 28.8478C24.1308 28.6964 24.4432 28.44 24.6629 28.1111C24.8827 27.7822 25 27.3956 25 27C25 26.4696 24.7893 25.9609 24.4142 25.5858C24.0391 25.2107 23.5304 25 23 25ZM28.675 9.275L25.375 20.825C25.1938 21.4511 24.8144 22.0016 24.2938 22.3938C23.7731 22.7859 23.1393 22.9986 22.4875 23H10.5125C9.86068 22.9986 9.22689 22.7859 8.70625 22.3938C8.18561 22.0016 7.80621 21.4511 7.625 20.825L4.325 9.2875V9.2625L3.1 5H1C0.734784 5 0.48043 4.89464 0.292893 4.70711C0.105357 4.51957 0 4.26522 0 4C0 3.73478 0.105357 3.48043 0.292893 3.29289C0.48043 3.10536 0.734784 3 1 3H3.1C3.53437 3.00157 3.95658 3.14365 4.30354 3.405C4.6505 3.66634 4.90359 4.03293 5.025 4.45L6.0375 8H27.7125C27.8674 7.99984 28.0202 8.03566 28.1589 8.10464C28.2976 8.17362 28.4184 8.27387 28.5117 8.3975C28.605 8.52112 28.6683 8.66474 28.6967 8.81702C28.725 8.9693 28.7176 9.12608 28.675 9.275ZM26.3875 10H6.6125L9.55 20.275C9.6098 20.4841 9.7361 20.6679 9.90979 20.7988C10.0835 20.9296 10.2951 21.0002 10.5125 21H22.4875C22.7049 21.0002 22.9165 20.9296 23.0902 20.7988C23.2639 20.6679 23.3902 20.4841 23.45 20.275L26.3875 10Z" />
                                <path d="M20.7071 16.2071C20.8946 16.0196 21 15.7652 21 15.5C21 15.2348 20.8946 14.9804 20.7071 14.7929C20.5196 14.6054 20.2652 14.5 20 14.5H17.5V12C17.5 11.7348 17.3946 11.4804 17.2071 11.2929C17.0196 11.1054 16.7652 11 16.5 11C16.2348 11 15.9804 11.1054 15.7929 11.2929C15.6054 11.4804 15.5 11.7348 15.5 12V14.5H13C12.7348 14.5 12.4804 14.6054 12.2929 14.7929C12.1054 14.9804 12 15.2348 12 15.5C12 15.7652 12.1054 16.0196 12.2929 16.2071C12.4804 16.3946 12.7348 16.5 13 16.5H15.5V19C15.5 19.2652 15.6054 19.5196 15.7929 19.7071C15.9804 19.8946 16.2348 20 16.5 20C16.7652 20 17.0196 19.8946 17.2071 19.7071C17.3946 19.5196 17.5 19.2652 17.5 19V16.5H20C20.2652 16.5 20.5196 16.3946 20.7071 16.2071Z" />
                            </svg>
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