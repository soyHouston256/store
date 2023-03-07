import Navbar from "@/components/Navbar"
import CartList from "@/components/CartList"
import CartOrder from "@/components/CartOrder"
import { Outlet } from "react-router-dom"
import styled from "styled-components"
import CartClient from "@/components/CartClient"
import { useState } from "react"

const CartWrapper = styled.section`
    display: grid;
    grid-template-columns: 1fr 320px;
    grid-gap: 25px;
    width: var(--screen-desktop);
    margin: 0 auto;
    margin-bottom: 20px;
    @media screen and (max-width: 1024px){
        width: var(--screen-tablet);
        grid-template-columns: 1fr 280px;
    }
    @media screen and (max-width: 768px){
        width: var(--screen-phone);
        grid-template-columns: 1fr;
    }
    @media screen and (max-width: 425px){
        width: calc(100% - 40px);
        grid-gap: 20px;
    }
`

const CartCol = styled.div`
    display: flex;
    flex-direction: column;
    gap: 25px;
    @media screen and (max-width: 425px){
        gap: 20px;
    }
`

function Cart(): JSX.Element {
    const [trigger, setTrigger] = useState(false)

    return (
        <div>
            <Navbar />
            <CartWrapper>
                <CartCol>
                    <CartList />
                    <CartClient trigger={trigger} />
                </CartCol>
                <CartOrder setTrigger={setTrigger} />
            </CartWrapper>
            <Outlet />
        </div>
    )
}

export default Cart