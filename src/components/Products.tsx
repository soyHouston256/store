import Card from '@/components/Card';
import useProductsList from '@/hooks/useProductsList';
import styled from "styled-components"

const ProductsGrid = styled.section`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 25px;
    width: var(--screen-desktop);
    margin: 0 auto;
    margin-top: 40px;
`

function Products(): JSX.Element {
    // TODO: get products from firebase
    const { products } = useProductsList()

    return(
        <ProductsGrid>
            { products.map((product) => <Card key={product.id} product={product} />)}
        </ProductsGrid>
    )
}

export default Products