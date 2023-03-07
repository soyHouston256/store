import Card from '@/components/Card';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import styled from "styled-components"
import CardShimmer from './CardShimmer';

const ProductsGrid = styled.section`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 25px;
    width: var(--screen-desktop);
    margin: 0 auto;
    margin-top: 40px;
    margin-bottom: 40px;
    @media screen and (max-width: 1024px){
		width: var(--screen-tablet);
        margin-top: 25px;
        margin-bottom: 25px;
        grid-gap: 15px;
	}
	@media screen and (max-width: 768px){
		width: var(--screen-phone);
        grid-template-columns: 1fr 1fr;
    }
     @media screen and (max-width: 425px){
		width: calc(100% - 40px);
		margin: 20px;
        grid-gap: 10px;
	}
`

function Products(): JSX.Element {
    const { productsFiltered } = useSelector(
        (state: RootState) => state.products
    )

    return(
        <ProductsGrid>
            {productsFiltered.map((product) => <Card key={product.id} product={product} />)}
            { !productsFiltered.length &&
                <>
                    <CardShimmer />
                    <CardShimmer />
                    <CardShimmer />
                    <CardShimmer />
                </>
            }
        </ProductsGrid>
    )
}

export default Products