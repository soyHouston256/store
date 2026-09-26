import Card from '@/components/Card';
import CategoryFilters from '@/components/CategoryFilters';
import SearchBox from '@/components/SearchBox';
import SortSelect from '@/components/SortSelect';
import CardShimmer from '@/components/CardShimmer';
import Container from '@/components/layout/Container';
import { RootState } from '@/store';
import { useCatalogStatus } from '@/hooks/useProductsList';
import { useCatalogParams, useCatalogUrlSync } from '@/hooks/useCatalogUrlSync';
import { useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from "styled-components"

// Sección "Nuestro catálogo" (spec 02 §3, R3.1, R3.5). Monta `useCatalogUrlSync`
// (URL → Redux). Estados: shimmers solo con `loading`; error con "Reintentar";
// "Aún no hay diseños" con lista vacía; conteo y "Ver los N diseños" solo con data.
const ProductsSection = styled.section`
    padding-top: 72px;
    @media screen and (max-width: 1024px){
        padding-top: 48px;
    }
    @media screen and (max-width: 640px){
        padding-top: 40px;
    }
`
const SectionHeader = styled(Container)`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
    h2 {
        margin: 0;
        font-family: var(--dh-font-display);
        font-size: var(--dh-text-h2);
        font-weight: 800;
        letter-spacing: -0.02em;
        line-height: 1.05;
        color: var(--dh-ink);
    }
    p {
        margin: 6px 0 0;
        font-size: 15px;
        color: var(--dh-muted);
        min-height: 1.4em;
    }
    @media screen and (max-width: 640px){
        h2 {
            font-size: 32px;
        }
    }
`
const StateBox = styled.div`
    margin: 24px 0 40px;
    text-align: center;
    padding: 48px 20px;
    background-color: var(--dh-surface);
    border: 1px solid var(--dh-line);
    border-radius: var(--dh-radius-lg);
    p {
        color: var(--dh-ink-2);
        font-size: 16px;
        line-height: 1.5;
        margin: 0;
    }
    p + p {
        margin-top: 6px;
        color: var(--dh-muted);
        font-size: 14px;
    }
    button {
        margin-top: 18px;
        height: 44px;
        padding: 0 22px;
        border-radius: 22px;
        border: 1.5px solid var(--dh-ink);
        background: transparent;
        color: var(--dh-ink);
        font-family: inherit;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        &:hover {
            background: var(--dh-ink);
            color: var(--color-text-invert);
        }
        &:focus-visible {
            outline: 2px solid var(--dh-ink);
            outline-offset: 2px;
        }
    }
`
const ProductsGrid = styled(Container)`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
    margin-top: 24px;
    scroll-margin-top: 96px;
    @media screen and (max-width: 1024px){
        grid-template-columns: repeat(2, minmax(0, 1fr));
        margin-top: 20px;
    }
    @media screen and (max-width: 640px){
        gap: 12px;
        margin-top: 16px;
    }
`
const ShowAll = styled(Container)`
    display: flex;
    justify-content: center;
    padding-top: 32px;
    button {
        height: 52px;
        padding: 0 32px;
        border-radius: 26px;
        border: 1.5px solid var(--dh-ink);
        background: transparent;
        color: var(--dh-ink);
        font-family: inherit;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: background .15s ease, color .15s ease;
        &:hover {
            background: var(--dh-ink);
            color: var(--color-text-invert);
        }
        &:focus-visible {
            outline: 2px solid var(--dh-ink);
            outline-offset: 2px;
        }
    }
`

const plural = (count: number, singular: string, pluralForm: string) => count === 1 ? singular : pluralForm

function Products(): JSX.Element {
    useCatalogUrlSync()
    const { productsFiltered, products } = useSelector((state: RootState) => state.products)
    const { loading, error, reload } = useCatalogStatus()
    const { clearAll } = useCatalogParams()
    const gridRef = useRef<HTMLDivElement>(null)

    const hasData = !loading && !error
    const total = productsFiltered.length
    const countLabel = total === products.length
        ? `${total} ${plural(total, 'diseño disponible', 'diseños disponibles')}`
        : `${total} de ${products.length} ${plural(products.length, 'diseño', 'diseños')}`

    const scrollToGrid = () => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    return (
        <ProductsSection id="catalogo" aria-labelledby="catalogo-title">
            <SectionHeader>
                <div>
                    <h2 id="catalogo-title">Nuestro catálogo</h2>
                    <p aria-live="polite">{hasData && products.length > 0 ? countLabel : ''}</p>
                </div>
                <SortSelect />
            </SectionHeader>
            <SearchBox />
            <CategoryFilters />
            {loading && (
                <ProductsGrid as="section" aria-busy="true" aria-label="Cargando catálogo">
                    {Array.from({ length: 8 }, (_, index) => <CardShimmer key={index} />)}
                </ProductsGrid>
            )}
            {!loading && error && (
                <Container>
                    <StateBox role="alert">
                        <p>No pudimos cargar el catálogo.</p>
                        <p>{error}</p>
                        <button type="button" onClick={reload}>Reintentar</button>
                    </StateBox>
                </Container>
            )}
            {hasData && products.length === 0 && (
                <Container>
                    <StateBox>
                        <p>Aún no hay diseños.</p>
                        <p>Estamos preparando el catálogo; vuelve pronto.</p>
                    </StateBox>
                </Container>
            )}
            {hasData && products.length > 0 && total === 0 && (
                <Container>
                    <StateBox>
                        <p>No encontramos productos con esos filtros.</p>
                        <p>Prueba con otra búsqueda o categoría.</p>
                        <button type="button" onClick={clearAll}>Quitar filtros</button>
                    </StateBox>
                </Container>
            )}
            {hasData && total > 0 && (
                <>
                    <ProductsGrid as="section" ref={gridRef} aria-label="Productos">
                        {productsFiltered.map((product) => <Card key={product.id} product={product} />)}
                    </ProductsGrid>
                    <ShowAll>
                        <button type="button" onClick={scrollToGrid}>
                            Ver {total === 1 ? 'el' : 'los'} {total} {plural(total, 'diseño', 'diseños')}
                        </button>
                    </ShowAll>
                </>
            )}
        </ProductsSection>
    )
}

export default Products
