import { RootState } from "@/store"
import { motion } from "framer-motion"
import { useSelector, shallowEqual } from "react-redux"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import ProductCart from "./ProductCart"

const CartWrapper = styled(motion.div)`
	position: absolute;
    right: -20px;
    top: 50px;
    min-width: 360px;
    z-index: 5;
    .cart_content {
        background-color: var(--color-surface-light);
        border: 1px solid var(--color-border);
        border-radius: var(--radius);
	    box-shadow: var(--shadow-dark);
        .tip {
            position: absolute;
            top: -10px;
            right: 23px;
            width: 18px;
            height: 18px;
            border-top: 1px solid var(--color-border);
            border-left: 1px solid var(--color-border);
            background-color:  var(--color-surface-light);
            transform: rotate(45deg);
        }
        h1 {
            padding: 10px 25px;
            padding-top: 25px;
            text-transform: uppercase;
            letter-spacing: .03rem;
            font-weight: 600;
            font-size: 13px;
            display: block;
            margin-bottom: 8px;
            opacity: .5;
            color: var(--color-text)
        }
        ul {
            max-height: 50vh;
            overflow: auto;
            padding: 0 25px;
        }
        .go_to_cart {
            padding: 15px 25px;
        }
    }
    @media screen and (max-width: 425px){
        position: fixed;
        right: 0;
        top: inherit;
        bottom: 0;
        width: 100%;
        .cart_content {
            border-radius: var(--radius) var(--radius) 0 0;
            .tip {
                display: none;
            }
            ul {
                max-height: calc(100vh - 250px);
            }
        }
        &:before {
            content: '';
            margin-bottom: calc(-1 * var(--radius));
            height: 100vh;
            width: 100%;
            display: block;
            background-color: rgba(0,0,0,.7);
            pointer-events: none;
        }
    }
`

const CartEmpty = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 280px;
    flex-direction: column;
    gap: 15px;
    color: var(--color-text);
    p {
        opacity: .5;
        font-size: 15px;
    }
    svg {
        fill: var(--color-text);
        opacity: .7;
        width: 36px;
        margin-left: -8px;
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

function Cart({ innerRef }: { innerRef: any }): JSX.Element {
    const navigate = useNavigate();
    const { productsCart } = useSelector(
        (state: RootState) => state.cart
    )
    const goToOrder = () => {
        navigate('/cart')
    }
    return (
        <CartWrapper
            initial={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 10 }}>
            <div className="cart_content" ref={innerRef} >
                <div className="tip"></div>
                {productsCart.length > 0 && 
                    <div>
                        <h1>Carrito</h1>
                        <ul>
                            {productsCart.map((product) => <ProductCart compact={true} product={product} key={product._id} />)}
                        </ul>
                        <div className="go_to_cart">
                            <Button onClick={goToOrder}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256"><path d="M220 52v152a16 16 0 0 1-16 16h-68.4a8 8 0 0 1 0-16H204V52H52v91.3a8 8 0 0 1-16 0V52a16 16 0 0 1 16-16h152a16 16 0 0 1 16 16Zm-86.3 94.3a8.1 8.1 0 0 0-11.4 0L64 204.7l-26.3-26.4a8.1 8.1 0 0 0-11.4 11.4l32 32a8.2 8.2 0 0 0 11.4 0l64-64a8.1 8.1 0 0 0 0-11.4Z" /></svg>
                                <span> Verificar pedido </span>
                            </Button>
                        </div>
                    </div>
                }
                {!productsCart.length &&
                    <CartEmpty>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 40" fill="none"> <path d="M18.2778 36.8883C18.2778 37.4253 18.1181 37.9502 17.819 38.3967C17.5199 38.8431 17.0948 39.1911 16.5973 39.3966C16.0999 39.6021 15.5526 39.6559 15.0245 39.5511C14.4964 39.4464 14.0114 39.1878 13.6307 38.8081C13.25 38.4284 12.9907 37.9446 12.8857 37.418C12.7806 36.8913 12.8345 36.3454 13.0406 35.8493C13.2466 35.3532 13.5955 34.9292 14.0432 34.6309C14.4909 34.3325 15.0172 34.1733 15.5556 34.1733C16.2776 34.1733 16.97 34.4594 17.4805 34.9685C17.991 35.4777 18.2778 36.1682 18.2778 36.8883ZM35.7778 34.1733C35.2394 34.1733 34.7131 34.3325 34.2654 34.6309C33.8177 34.9292 33.4688 35.3532 33.2628 35.8493C33.0568 36.3454 33.0029 36.8913 33.1079 37.418C33.2129 37.9446 33.4722 38.4284 33.8529 38.8081C34.2336 39.1878 34.7187 39.4464 35.2467 39.5511C35.7748 39.6559 36.3221 39.6021 36.8196 39.3966C37.317 39.1911 37.7421 38.8431 38.0412 38.3967C38.3404 37.9502 38.5 37.4253 38.5 36.8883C38.5 36.1682 38.2132 35.4777 37.7027 34.9685C37.1922 34.4594 36.4998 34.1733 35.7778 34.1733V34.1733ZM44.2361 9.27305L39.1028 27.1919C38.8429 28.0832 38.3011 28.8668 37.5583 29.426C36.8154 29.9852 35.9112 30.2899 34.9806 30.2948H16.3528C15.4221 30.2899 14.518 29.9852 13.7751 29.426C13.0323 28.8668 12.4905 28.0832 12.2306 27.1919L7.09725 9.31184V9.25366L5.19169 2.66013C5.17363 2.57637 5.12686 2.5015 5.05943 2.44841C4.99201 2.39532 4.90814 2.36733 4.82225 2.36924H1.55558C1.24616 2.36924 0.949417 2.24665 0.730625 2.02844C0.511832 1.81023 0.388916 1.51427 0.388916 1.20568C0.388916 0.897082 0.511832 0.601125 0.730625 0.382914C0.949417 0.164704 1.24616 0.0421143 1.55558 0.0421143H4.82225C5.41546 0.0442095 5.992 0.238143 6.46531 0.594804C6.93862 0.951465 7.28317 1.45161 7.44725 2.02017L9.10003 7.79921H43.1084C43.2895 7.79921 43.4681 7.84126 43.6301 7.92205C43.7921 8.00283 43.933 8.12012 44.0417 8.26463C44.1493 8.40668 44.2228 8.57146 44.2565 8.74629C44.2902 8.92112 44.2832 9.10133 44.2361 9.27305V9.27305ZM41.5722 10.1263H9.76114L14.4861 26.552C14.6004 26.9584 14.8445 27.3166 15.1814 27.572C15.5183 27.8275 15.9296 27.9664 16.3528 27.9676H34.9806C35.4038 27.9664 35.8151 27.8275 36.152 27.572C36.4889 27.3166 36.733 26.9584 36.8472 26.552L41.5722 10.1263Z" /> <path d="M20.4747 14.6626C20.3157 14.9077 20.2308 15.196 20.2308 15.4908C20.2308 15.8862 20.3833 16.2654 20.6548 16.545C20.9262 16.8246 21.2944 16.9817 21.6783 16.9817C21.9646 16.9817 22.2445 16.8943 22.4825 16.7304C22.7206 16.5666 22.9061 16.3338 23.0157 16.0614C23.1252 15.789 23.1539 15.4892 23.098 15.2C23.0422 14.9108 22.9043 14.6452 22.7019 14.4367C22.4994 14.2282 22.2415 14.0862 21.9607 14.0286C21.6799 13.9711 21.3889 14.0006 21.1244 14.1135C20.8599 14.2263 20.6338 14.4174 20.4747 14.6626Z" /> <path d="M29.1599 14.6626C29.0009 14.9077 28.916 15.196 28.916 15.4908C28.916 15.8862 29.0685 16.2654 29.3399 16.545C29.6114 16.8246 29.9796 16.9817 30.3635 16.9817C30.6498 16.9817 30.9296 16.8943 31.1677 16.7304C31.4057 16.5666 31.5913 16.3338 31.7008 16.0614C31.8104 15.789 31.8391 15.4892 31.7832 15.2C31.7273 14.9108 31.5895 14.6452 31.387 14.4367C31.1846 14.2282 30.9267 14.0862 30.6459 14.0286C30.3651 13.9711 30.074 14.0006 29.8095 14.1135C29.545 14.2263 29.319 14.4174 29.1599 14.6626Z" /> <path d="M31.9676 24.1934C32.0331 23.9397 31.9985 23.6696 31.8713 23.442C31.2785 22.3842 30.4257 21.5058 29.3987 20.8951C28.3718 20.2844 27.2068 19.9628 26.0209 19.9628C24.835 19.9628 23.67 20.2844 22.6431 20.8951C21.6161 21.5058 20.7633 22.3842 20.1705 23.442C20.0949 23.5549 20.0429 23.6826 20.0176 23.8172C19.9923 23.9517 19.9943 24.0902 20.0235 24.2239C20.0526 24.3577 20.1083 24.4837 20.1871 24.5942C20.2658 24.7047 20.3659 24.7972 20.481 24.866C20.5962 24.9347 20.7239 24.9782 20.8561 24.9936C20.9883 25.0091 21.1222 24.9963 21.2494 24.9559C21.3765 24.9155 21.4942 24.8484 21.595 24.759C21.6958 24.6695 21.7776 24.5595 21.8351 24.4359C22.2601 23.6802 22.8705 23.0528 23.6052 22.6166C24.3399 22.1805 25.1729 21.9509 26.0209 21.9509C26.8689 21.9509 27.7019 22.1805 28.4366 22.6166C29.1713 23.0528 29.7817 23.6802 30.2067 24.4359C30.2881 24.5891 30.4088 24.7164 30.5555 24.804C30.7022 24.8916 30.8694 24.9362 31.039 24.9329C31.209 24.9343 31.3761 24.887 31.5215 24.7962C31.7417 24.6638 31.902 24.4471 31.9676 24.1934Z"/> </svg>
                        <p>Tu carrito está vacío</p>
                    </CartEmpty>
                }
            </div>
        </CartWrapper>
    )
}

export default Cart