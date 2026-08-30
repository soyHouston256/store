import Card from '@/components/Card';
import CategoryFilters from '@/components/CategoryFilters';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import styled from "styled-components"
import CardShimmer from './CardShimmer';

const ProductsSection = styled.section`
    padding-top: 8px;
`
const SectionHeader = styled.div`
    width: var(--screen-desktop);
    margin: 40px auto 0;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    h2 {
        font-size: var(--font-size-section-title);
        font-weight: 800;
        color: var(--color-text);
        margin: 0;
    }
    p {
        margin: 0;
        font-size: var(--font-size-text-sm);
        color: var(--color-text);
        opacity: .55;
    }
    @media screen and (max-width: 1024px){
		width: var(--screen-tablet);
	}
	@media screen and (max-width: 768px){
		width: var(--screen-phone);
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }
     @media screen and (max-width: 425px){
		width: calc(100% - 40px);
		margin: 30px 20px 0;
	}
`
const EmptyState = styled.div`
    width: var(--screen-desktop);
    margin: 40px auto;
    text-align: center;
    padding: 60px 20px;
    background-color: var(--color-neutral);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    p {
        color: var(--color-text);
        opacity: .6;
        font-size: var(--font-size-text);
        margin: 0;
    }
    @media screen and (max-width: 1024px){
		width: var(--screen-tablet);
	}
	@media screen and (max-width: 768px){
		width: var(--screen-phone);
    }
     @media screen and (max-width: 425px){
		width: calc(100% - 40px);
	}
`
const ProductsGrid = styled.section`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 25px;
    width: var(--screen-desktop);
    margin: 0 auto;
    margin-top: 24px;
    margin-bottom: 40px;
    @media screen and (max-width: 1024px){
		width: var(--screen-tablet);
        margin-top: 18px;
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
        margin-top: 18px;
	}
`

function Products(): JSX.Element {
    const { productsFiltered, products } = useSelector(
        (state: RootState) => state.products
    )
    const isLoading = !products.length

    return (
        <ProductsSection id="catalogo">
            <SectionHeader>
                <h2>Nuestro catálogo</h2>
                <p>{productsFiltered.length} diseño{productsFiltered.length === 1 ? '' : 's'} disponible{productsFiltered.length === 1 ? '' : 's'}</p>
            </SectionHeader>
            <CategoryFilters />
            {isLoading
                ? (
                    <ProductsGrid>
                        <CardShimmer />
                        <CardShimmer />
                        <CardShimmer />
                        <CardShimmer />
                    </ProductsGrid>
                )
                : productsFiltered.length
                    ? (
                        <ProductsGrid>
                            {productsFiltered.map((product) => <Card key={product.id} product={product} />)}
                        </ProductsGrid>
                    )
                    : (
                        <EmptyState>
                            <p>No encontramos productos con esos filtros. Prueba con otra búsqueda o categoría.</p>
                        </EmptyState>
                    )
            }
        </ProductsSection>
    )
}

export default Products
