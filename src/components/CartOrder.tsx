import useOrderCreate from "@/hooks/useOrderCreate"
import { RootState } from "@/store"
import { removeUser, updateTotal } from "@/store/slices/orders"
import { removeAllProducts } from "@/store/slices/products"
import { OrderType } from "@/types/OrderType"
import { ProductCartType } from "@/types/ProductType"
import { ID } from "@/utils/helpers"
import { Dispatch, useCallback, useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import styled from "styled-components"
import { useLocalStorage } from "usehooks-ts"

const CartOrderWrapper = styled.div`
    background-color: var(--color-neutral);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 25px;
    height: fit-content;
    position: sticky;
    top: 25px;
    h1 {
        padding-bottom: 10px;
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
        li {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 15px;
            &.total {
                color: var(--color-text);
                border-bottom: 1px solid var(--color-border);
                padding-bottom: 15px;
                b {
                    font-weight: 600;
                }
            }
        }
    }
    @media screen and (max-width: 425px){
        padding: 20px;
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
    .spinner {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid var(--color-text-invert);
        border-bottom: 2px solid transparent;
        animation: spinner .3s ease-in infinite;
    }
`

const StickerCard = styled.div`
    padding: 15px 10px;
    display: flex;
    gap: 8px;
    background-color: var(--color-warning-light);
    width: 100%;
    border-radius: 4px;
    border: 1px solid var(--color-border);
    margin-bottom: 4px;
    svg {
        fill: var(--color-warning)
    }
    .stickers_card_detail {
        color: var(--color-text);
        b {
            font-weight: 600;
            font-size: 15px;
            margin-bottom: 2px;
            display: block;
        }
        p {
            font-size: 13px;
            opacity: .7;
        }
    }
`

const DeliveryCard = styled.div`
    padding: 15px 10px;
    display: flex;
    gap: 8px;
    background-color: var(--color-accent-light);
    width: 100%;
    border-radius: 4px;
    border: 1px solid var(--color-border);
    margin-top: 4px;
    svg {
        fill: var(--color-accent)
    }
    .delivery_card_detail {
        color: var(--color-text);
        b {
            font-weight: 600;
            font-size: 15px;
            margin-bottom: 2px;
            display: block;
        }
        p {
            font-size: 13px;
            opacity: .7;
        }
    }
`

function CartOrder({ setTrigger }: any): JSX.Element {
    const [order, setOrder] = useLocalStorage('order', '')
    const [loading, setLoading] = useState(false)
    const dispatch: Dispatch<any> = useDispatch()
    const { productsCart } = useSelector(
        (state: RootState) => state.products
    )
    const { user, total } = useSelector(
        (state: RootState) => state.orders
    )
    const setTotal = useCallback(
        (total: number) => dispatch(updateTotal({ total })),
        [dispatch]
    )
    const clearCart = useCallback(
        () => dispatch(removeAllProducts()),
        [dispatch]
    )
    const clearUser = useCallback(
        () => dispatch(removeUser()),
        [dispatch]
    )

    useEffect(() => {
        const totalCart = productsCart.reduce(
            (sum, product: ProductCartType) => sum + product.quantity! * product.price!,
            0
        )
        setTotal(totalCart)
    }, [productsCart])

    const openWhastapp = (code: string) => {
        window.open(`https://api.whatsapp.com/send?phone=51980687918&text=%F0%9F%91%8B%20Hola,%20realic%C3%A9%20un%20pedido%20con%20el%20c%C3%B3digo%20%20*${code}*%20en%20la%20tienda%20de%20hooks.pe%20`)
    }

    const completeOrder = async (order: OrderType) => {
        setOrder(order.id!)
        clearCart()
        clearUser()
        openWhastapp(order.id!)
        location.href = '/done'
    }

    const registerOrder = async () => {
        setTrigger(true)
        if (!user.dni || !user.name || !user.phone) return
        try {
            setLoading(true)
            const order: OrderType = {
                id: ID(),
                user,
                products: productsCart,
                total
            }
            await useOrderCreate(order)
            completeOrder(order)
        } catch (err) {
            console.error(err)
        }
    }
    return (
        <CartOrderWrapper>
            <h1>Pedido</h1>
            <ul>
                <li className="total">
                    <p>Total</p>
                    <b>S/ {total}</b>
                </li>
                { total > 90 &&
                    <li>
                        <DeliveryCard>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path d="M230 70.8h-.1a16.7 16.7 0 0 0-5.9-5.9l-88-49.7a16.2 16.2 0 0 0-15.7 0l-88 49.5a16.2 16.2 0 0 0-6 5.9a.1.1 0 0 1-.1.1v.2a15 15 0 0 0-2.1 7.8v98.6a16.1 16.1 0 0 0 8.2 14l88 49.5a16.5 16.5 0 0 0 7.2 2h1.4a16.5 16.5 0 0 0 7.1-2l88-49.5a16.2 16.2 0 0 0 8.1-14V78.7a15.6 15.6 0 0 0-2.1-7.9ZM128.1 29.2L207.9 74l-30.7 17.4l-80.6-44.5Zm.9 89.6L48.5 74l31.7-17.8l80.7 44.5ZM40.1 87.6l80.9 45.1l-.8 89.7l-80.1-45.1Zm96.1 134.7l.8-89.6l32.1-18.3v38.1a8 8 0 0 0 16 0v-47.2l31-17.6v89.6Z" /></svg>
                            <div className="delivery_card_detail">
                                <b>Delivery gratis</b>
                                <p>Por pedido mayor a S/ 70</p>
                            </div>
                        </DeliveryCard>
                        
                    </li>
                }
                <li>
                    <StickerCard>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path d="M223.9 137.2a4.9 4.9 0 0 0 .1-1.2V88a56 56 0 0 0-56-56H88a56 56 0 0 0-56 56v80a56 56 0 0 0 56 56h49.4l1.1-.3c26.3-8.8 76.3-58.8 85.1-85.1l.3-1.1ZM48 168V88a40 40 0 0 1 40-40h80a40 40 0 0 1 40 40v40h-24a56 56 0 0 0-56 56v24H88a40 40 0 0 1-40-40Zm96 35.1V184a40 40 0 0 1 40-40h19.1c-12.1 19.5-39.6 47-59.1 59.1Z" /></svg>
                        <div className="stickers_card_detail">
                            <b>Stickers gratis</b>
                            <p>Recibiras 4 stickers gratis</p>
                        </div>
                    </StickerCard>
                </li>
                {!loading &&
                    <Button onClick={registerOrder}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16Zm0 160H40V56h176v144ZM176 88a48 48 0 0 1-96 0a8 8 0 0 1 16 0a32 32 0 0 0 64 0a8 8 0 0 1 16 0Z" /></svg>
                        <span> Confirmar pedido </span>
                    </Button>
                }
                {loading &&
                    <Button>
                        <div className="spinner"></div>
                    </Button>
                }
            </ul>
        </CartOrderWrapper>
    )
}

export default CartOrder