import { RootState } from "@/store";
import { updateUser } from "@/store/slices/orders";
import { UserType } from "@/types/UserType";
import { Dispatch, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import styled from "styled-components"
import { withMask } from 'use-mask-input';

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
                color: var(--color-text);
                position: relative;
                width: fit-content;
                .error {
                    display: none;
                    position: absolute;
                    left: calc(100% + 5px);
                    top: -1px;
                }
                &.required {
                    .error {
                        display: flex;
                        align-items: center;
                        gap: 2px;
                        color: var(--color-error);
                    }
                }
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

function CartClient({ trigger }: any): JSX.Element {
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
                    <label className={!user.dni && trigger ? 'required' : ''}>
                        DNI
                        <div className="error">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256"><path fill="currentColor" d="M128 20a108 108 0 1 0 108 108A108.1 108.1 0 0 0 128 20Zm0 192a84 84 0 1 1 84-84a84.1 84.1 0 0 1-84 84Zm-12-80V80a12 12 0 0 1 24 0v52a12 12 0 0 1-24 0Zm28 40a16 16 0 1 1-16-16a16 16 0 0 1 16 16Z" /></svg>
                            requerido
                        </div>
                    </label>
                    <input
                        type="text"
                        placeholder="ejem: 71010101"
                        ref={withMask('99999999')}
                        value={user.dni}
                        onChange={(event) => {
                            setUser({dni: event.target.value});
                        }}
                    />
                </fieldset>
                <fieldset>
                    <label className={!user.name && trigger ? 'required' : ''}>
                        Nombres y Apellidos
                        <div className="error">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256"><path fill="currentColor" d="M128 20a108 108 0 1 0 108 108A108.1 108.1 0 0 0 128 20Zm0 192a84 84 0 1 1 84-84a84.1 84.1 0 0 1-84 84Zm-12-80V80a12 12 0 0 1 24 0v52a12 12 0 0 1-24 0Zm28 40a16 16 0 1 1-16-16a16 16 0 0 1 16 16Z" /></svg>
                            requerido
                        </div>
                    </label>
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
                    <label className={!user.phone && trigger ? 'required' : ''}>
                        Celular
                        <div className="error">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256"><path fill="currentColor" d="M128 20a108 108 0 1 0 108 108A108.1 108.1 0 0 0 128 20Zm0 192a84 84 0 1 1 84-84a84.1 84.1 0 0 1-84 84Zm-12-80V80a12 12 0 0 1 24 0v52a12 12 0 0 1-24 0Zm28 40a16 16 0 1 1-16-16a16 16 0 0 1 16 16Z" /></svg>
                            requerido
                        </div>
                    </label>
                    <input
                        type="text"
                        placeholder="ejem: 999222333"
                        ref={withMask('999-999-999')}
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