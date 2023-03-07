import { addToCart, removeFromCart } from "@/store/slices/products"
import { ProductCartActionType, ProductCartType, ProductType } from "@/types/ProductType"
import { Dispatch, useCallback } from "react"
import { useDispatch } from "react-redux"
import styled from "styled-components"
import TShirt from "./TShirt"

const ProductCartWrapper = styled.li`
    display: flex;
    align-items: center;
    gap: 15px;
    border-bottom: 1px solid var(--color-border);
    padding: 10px 0;
    min-height: 48px;
    &:first-child {
        margin-top: -10px;
    }
    &:last-child {
        border-bottom: none;
    }
    picture {
        width: 56px;
    }
    .product_cart_content {
        display: flex;
        align-items: center;
        width: 100%;
        .product_cart_detail {
            flex: 1;
            p {
                color: var(--color-text);
                opacity: .7;
                font-size: 15px;
            }
            b {
                color: var(--color-text);
                font-weight: 600;
                font-size: 15px;
            }
        }
        .product_cart_quantity {
            display: flex;
            align-items: center;
            gap: 10px;
            p {
                font-weight: 600;
                font-size: 14px;
                color: var(--color-text)
            }
            span {
                border-radius: 50%;
                width: 28px;
                height: 28px;
                display: flex;
                justify-content: center;
                align-items: center;
                border: 1px solid var(--color-border);
                font-size: 15px;
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
    &.compact {
        gap: 10px;
        picture {
            width: 32px;
        }
    }
    @media screen and (max-width: 425px) {
        gap: 10px;
        picture {
            width: 32px;
        }
    }
`

const ProductCartDetailExtra = styled.div`
    margin-top: 4px;
    display: flex;
    gap: 10px;
    span {
        &.size {
            border-radius: 4px;
            width: 22px;
            height: 22px;
            display: flex;
            justify-content: center;
            align-items: center;
            border: 1px solid var(--color-border);
            font-size: 12px;
            font-weight: 600;
            background-color: var(--color-surface);
            color: var(--color-text);
        }
        &.color {
            border-radius: 50%;
            border-radius: 4px;
            width: 22px;
            height: 22px;
            border: 1px solid var(--color-border);
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
    &.compact {
        span {
            &.size {
                width: 16px;
                height: 16px;
            }
            &.color {
                width: 16px;
                height: 16px;
            }
        }
    }
    @media screen and (max-width: 425px) {
        span {
            &.size {
                width: 16px;
                height: 16px;
            }
            &.color {
                width: 16px;
                height: 16px;
            }
        }
    }
`

function ProductCart({ product, compact = false }: { product: ProductCartType, compact: Boolean }): JSX.Element {
    const dispatch: Dispatch<any> = useDispatch()
    const addProduct = useCallback(
        (product: ProductType) => dispatch(addToCart({ type: ProductCartActionType.ADD, product})),
        [dispatch]
    )
    const removeProduct = useCallback(
        (product: ProductType) => dispatch(removeFromCart({ type: ProductCartActionType.REMOVE, product})),
        [dispatch]
    )
    const increment = () => {
        addProduct(product!)
    }
    const decrement = () => {
        removeProduct(product!)
    }

    return (
        <ProductCartWrapper className={compact ? 'compact' : ''} >
            {/* <img src={product.image} /> */}
            <TShirt image={product.image!} color={product.color!} />
            <div className="product_cart_content">
                <div className="product_cart_detail">
                    <b>S/ {product.price}</b>
                    <p>{product.name}</p>
                    <ProductCartDetailExtra className={compact ? 'compact' : ''}>
                        <span title="Talla" className="size">{product.size}</span>
                        <span title="Color" className="color" style={{ backgroundColor: product.color }}></span>
                    </ProductCartDetailExtra>
                </div>
                <div className="product_cart_quantity">
                    <span onClick={ decrement }> { product.quantity! > 1 ? '-' : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="M216 48h-36V36a28.1 28.1 0 0 0-28-28h-48a28.1 28.1 0 0 0-28 28v12H40a12 12 0 0 0 0 24h4v136a20.1 20.1 0 0 0 20 20h128a20.1 20.1 0 0 0 20-20V72h4a12 12 0 0 0 0-24ZM100 36a4 4 0 0 1 4-4h48a4 4 0 0 1 4 4v12h-56Zm88 168H68V72h120Zm-72-100v64a12 12 0 0 1-24 0v-64a12 12 0 0 1 24 0Zm48 0v64a12 12 0 0 1-24 0v-64a12 12 0 0 1 24 0Z"/></svg> } </span>
                    <p>{product.quantity}</p>
                    <span onClick={increment}>+</span>
                </div>
            </div>
        </ProductCartWrapper>
    )
}

export default ProductCart