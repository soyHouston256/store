import { ProductType } from "@/types/ProductType"
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
            }
        }
    }
`

function ProductCart({ product }: {product: ProductType}): JSX.Element {

    return (
        <ProductCartWrapper>
            <img src={product.image} />
            <div className="product_cart_content">
                <div className="product_cart_detail">
                    <p>{product.name}</p>
                    <b>S/ {product.price}</b>
                </div>
                <div className="product_cart_quantity">
                    <span>-</span>
                    <p>1</p>
                    <span>+</span>
                </div>
            </div>
            
        </ProductCartWrapper>
    )
}

export default ProductCart