import Card from '@/components/Card';
import useProductsList from '@/hooks/useProductsList';
import { RootState } from '@/store';
import { all } from '@/store/slices/products';
import { Dispatch, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
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
    const { products } = useSelector(
        (state: RootState) => state.products
    )

    return(
        <ProductsGrid>
            { products.map((product) => <Card key={product.id} product={product} />)}
        </ProductsGrid>
    )
}

export default Products