import { RootState } from "@/store";
import { updateUser } from "@/store/slices/orders";
import { UserType } from "@/types/UserType";
import { Dispatch, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import styled from "styled-components"

const CartClientWrapper = styled.div`
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
    .cart_client_form {
        display: flex;
        flex-direction: column;
        gap: 15px;
        fieldset {
            display: flex;
            flex-direction: column;
            gap: 5px;
            label {
                text-transform: uppercase;
                letter-spacing: .03rem;
                font-weight: 600;
                font-size: 12px;
                display: block;
                color: var(--color-text)
            }
            input {
                height: 42px;
                border-radius: 4px;
                border: 1px solid var(--color-border-dark);
                padding: 0 10px;
                font-size: 16px;
                background-color: var(--color-surface-light);
                color: var(--color-text);
                &:focus, &:active {
                    border-color: var(--color-accent);
                }
            }
        }
    }
`

function CartClient(): JSX.Element {
    const dispatch: Dispatch<any> = useDispatch()

    const { user } = useSelector(
        (state: RootState) => state.orders
    )
    const setUser = useCallback(
        (user: UserType) => dispatch(updateUser({user})),
        [dispatch]
    )

    const [lastname, setLastname] = useState('')
    const [phone, setPhone] = useState('')
    return (
        <CartClientWrapper>
            <h1>Datos</h1>
            <div className="cart_client_form">
                <fieldset>
                    <label>DNI</label>
                    <input
                        type="text"
                        placeholder="ejem: 71010101"
                        value={user.dni}
                        onChange={(event) => {
                            setUser({dni: event.target.value});
                        }}
                    />
                </fieldset>
                <fieldset>
                    <label>Nombres y Apellidos</label>
                    <input
                        type="text"
                        placeholder="ejem: Juan Perez Rodriguez"
                        value={user.name}
                        onChange={(event) => {
                            setUser({ name: event.target.value });
                        }}
                    />
                </fieldset>
                <fieldset>
                    <label>Celular</label>
                    <input
                        type="text"
                        placeholder="ejem: 999222333"
                        value={user.phone}
                        onChange={(event) => {
                            setUser({ phone: event.target.value });
                        }}
                    />
                </fieldset>
            </div>
        </CartClientWrapper>
    )
}

export default CartClient