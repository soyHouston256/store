import Card from '@/components/Card'
import CardShimmer from '@/components/CardShimmer'
import Container from '@/components/layout/Container'
import { RootState } from '@/store'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

// /favoritos (spec R2.2, design §4): productos cuyo id está en likes.likedList,
// con la misma Card del catálogo. Sin likes → mensaje vacío.
const Page = styled(Container)`
    padding-top: 48px;
    padding-bottom: 24px;
    color: var(--dh-ink);
    header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 24px;
        h1 {
            margin: 0;
            font-family: var(--dh-font-display);
            font-size: var(--dh-text-h2);
            font-weight: 800;
            letter-spacing: -0.02em;
            line-height: 1.1;
        }
        p {
            margin: 0;
            font-size: 15px;
            color: var(--dh-muted);
        }
    }
    @media screen and (max-width: 640px) {
        padding-top: 32px;
        header h1 {
            font-size: 32px;
        }
    }
`
const Grid = styled.section`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 25px;
    @media screen and (max-width: 1024px) {
        grid-gap: 15px;
    }
    @media screen and (max-width: 768px) {
        grid-template-columns: 1fr 1fr;
    }
`
const Empty = styled.div`
    text-align: center;
    padding: 60px 20px;
    background-color: var(--dh-surface);
    border: 1px solid var(--dh-line);
    border-radius: var(--dh-radius-lg);
    p {
        margin: 0 0 16px;
        color: var(--dh-muted);
        font-size: 16px;
        line-height: 1.5;
    }
    a {
        display: inline-flex;
        align-items: center;
        height: 44px;
        padding: 0 22px;
        border-radius: 22px;
        background: var(--dh-ink);
        color: var(--color-text-invert);
        font-weight: 600;
        font-size: 14px;
        text-decoration: none;
    }
`

function Favorites(): JSX.Element {
    const { likedList } = useSelector((state: RootState) => state.likes)
    const { products } = useSelector((state: RootState) => state.products)
    const favorites = products.filter((product) => product.id !== undefined && likedList.includes(product.id))
    const isLoading = products.length === 0 && likedList.length > 0

    useEffect(() => {
        document.title = 'Tus favoritos — devhaus.pe'
        return () => {
            document.title = 'devhaus.pe — Polos y accesorios para developers'
        }
    }, [])

    return (
        <Page as="section" aria-labelledby="favorites-title">
            <header>
                <h1 id="favorites-title">Tus favoritos</h1>
                {!isLoading && favorites.length > 0 &&
                    <p>{favorites.length} producto{favorites.length === 1 ? '' : 's'} guardado{favorites.length === 1 ? '' : 's'}</p>
                }
            </header>
            {isLoading ? (
                <Grid aria-busy="true">
                    {likedList.slice(0, 4).map((id) => <CardShimmer key={id} />)}
                </Grid>
            ) : favorites.length > 0 ? (
                <Grid>
                    {favorites.map((product) => <Card key={product.id} product={product} />)}
                </Grid>
            ) : (
                <Empty>
                    <p>Aún no tienes favoritos. Toca el corazón de un producto para guardarlo aquí.</p>
                    <Link to="/#catalogo">Ver catálogo</Link>
                </Empty>
            )}
        </Page>
    )
}

export default Favorites
