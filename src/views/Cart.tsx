import Navbar from "@/components/Navbar"
import CartList from "@/components/CartList"
import CartOrder from "@/components/CartOrder"
import { Outlet } from "react-router-dom"
import styled from "styled-components"
import CartClient from "@/components/CartClient"

const CartWrapper = styled.section`
    display: grid;
    grid-template-columns: 1fr 320px;
    grid-gap: 25px;
    width: var(--screen-desktop);
    margin: 0 auto;
`

const CartCol = styled.div`
    display: flex;
    flex-direction: column;
    gap: 25px;
`

function Cart(): JSX.Element {
    
    return (
        <div>
            <Navbar />
            <CartWrapper>
                <CartCol>
                    <CartList />
                    <CartClient />
                </CartCol>
                <CartOrder />
            </CartWrapper>
            <Outlet />
        </div>
    )
}

export default Cart