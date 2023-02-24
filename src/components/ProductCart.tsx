import { add, remove } from "@/store/slices/products"
import { ProductCartActionType, ProductCartType, ProductType } from "@/types/ProductType"
import { Dispatch, useCallback } from "react"
import { useDispatch } from "react-redux"
import styled from "styled-components"

const ProductCartWrapper = styled.li`
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid var(--color-border);
    padding: 10px 0;
    min-height: 48px;
    &:first-child {
        margin-top: -15px;
    }
    &:last-child {
        border-bottom: none;
    }
    img {
        width: 32px;
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
                font-size: 16px;
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
            }
        }
    }
`

function ProductCart({ product }: {product: ProductCartType}): JSX.Element {
    const dispatch: Dispatch<any> = useDispatch()
    const addProduct = useCallback(
        (product: ProductType) => dispatch(add({ type: ProductCartActionType.ADD, product})),
        [dispatch]
    )
    const removeProduct = useCallback(
        (product: ProductType) => dispatch(remove({ type: ProductCartActionType.REMOVE, product})),
        [dispatch]
    )
    const addToCart = () => {
        addProduct(product!)
    }
    const removeFromCart = () => {
        removeProduct(product!)
    }

    return (
        <ProductCartWrapper>
            <img src={product.image} />
            <div className="product_cart_content">
                <div className="product_cart_detail">
                    <p>{product.name}</p>
                    <b>S/ {product.price}</b>
                </div>
                <div className="product_cart_quantity">
                    <span onClick={ removeFromCart }> { product.quantity! > 1 ? '-' : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="M216 48h-36V36a28.1 28.1 0 0 0-28-28h-48a28.1 28.1 0 0 0-28 28v12H40a12 12 0 0 0 0 24h4v136a20.1 20.1 0 0 0 20 20h128a20.1 20.1 0 0 0 20-20V72h4a12 12 0 0 0 0-24ZM100 36a4 4 0 0 1 4-4h48a4 4 0 0 1 4 4v12h-56Zm88 168H68V72h120Zm-72-100v64a12 12 0 0 1-24 0v-64a12 12 0 0 1 24 0Zm48 0v64a12 12 0 0 1-24 0v-64a12 12 0 0 1 24 0Z"/></svg> } </span>
                    <p>{product.quantity}</p>
                    <span onClick={addToCart}>+</span>
                </div>
            </div>
        </ProductCartWrapper>
    )
}

export default ProductCart