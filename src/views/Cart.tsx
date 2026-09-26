import CartList from "@/components/CartList"
import CartOrder from "@/components/CartOrder"
import { Outlet } from "react-router-dom"
import styled from "styled-components"
import CartClient from "@/components/CartClient"
import { useState } from "react"
import Container from "@/components/layout/Container"

const CartWrapper = styled(Container)`
    display: grid;
    grid-template-columns: 1fr 320px;
    grid-gap: 25px;
    margin-top: 32px;
    margin-bottom: 20px;
    @media screen and (max-width: 1024px){
        grid-template-columns: 1fr 280px;
    }
    @media screen and (max-width: 768px){
        grid-template-columns: 1fr;
    }
    @media screen and (max-width: 425px){
        margin-top: 20px;
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
            <CartWrapper as="section">
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