import Card from '@/components/Card';
import styled from "styled-components"

function Products(): JSX.Element {
    // TODO: get products from firebase
    const productsList = [1, 2, 3, 4, 5, 6, 7, 8, 9]

    const ProductsGrid = styled.section`
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-gap: 25px;
        width: var(--screen-desktop);
		margin: 0 auto;
        margin-top: 40px;
    `

    return(
        <ProductsGrid>
            { productsList.map((p) => <Card/>)}
        </ProductsGrid>
    )
}

export default Products