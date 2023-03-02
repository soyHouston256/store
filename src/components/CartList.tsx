import { useSelector } from "react-redux"
import styled from "styled-components"
import { RootState } from "@/store"
import ProductCart from "./ProductCart"

const CartListWrapper = styled.div`
    background-color: var(--color-neutral);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 25px;
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
`

function CartList(): JSX.Element {
    const { productsCart } = useSelector(
        (state: RootState) => state.products
    )
    return (
        <CartListWrapper>
            <h1>Carrito</h1>
            <ul>
                {productsCart.map((product) => <ProductCart compact={false} product={product} key={product.id} />)}
            </ul>
        </CartListWrapper>
    )
}

export default CartList