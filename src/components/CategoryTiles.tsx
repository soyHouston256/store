import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Container from '@/components/layout/Container'
import { RootState } from '@/store'
import { useCatalogStatus } from '@/hooks/useProductsList'
import { site } from '@/config/site'
import { ProductKind } from '@/types/ProductType'

// Tiles de categoría (spec 02 §2 / R3.4, canvas Home.dc.html): grid 4 → 2 (≤1024)
// → 1 (≤640); alto 132, radio 20. Conteo real por tipo desde state.products
// (sin conteo mientras carga). Click → `?cat=` + scroll a #catalogo (ScrollManager
// + useCatalogUrlSync). "Tu diseño" → #personaliza. Polos: "Hombre y mujer · N diseños →" (spec R4.6).
const TilesGrid = styled(Container)`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    padding-top: 40px;
    @media screen and (max-width: 1024px){
        grid-template-columns: repeat(2, minmax(0, 1fr));
        padding-top: 24px;
    }
    @media screen and (max-width: 640px){
        grid-template-columns: 1fr;
        gap: 12px;
        padding-top: 20px;
    }
`
const Tile = styled(Link)<{ $bg: string; $fg: string; $sub: string; $dashed?: boolean }>`
    height: 132px;
    border-radius: var(--dh-radius-lg);
    background: ${({ $bg }) => $bg};
    color: ${({ $fg }) => $fg};
    border: ${({ $dashed, $fg }) => $dashed ? `1.5px dashed ${$fg}` : '1.5px solid transparent'};
    padding: 22px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-decoration: none;
    transition: transform .15s ease, box-shadow .15s ease;
    .title {
        font-family: var(--dh-font-display);
        font-size: 26px;
        font-weight: 700;
        letter-spacing: -0.01em;
        line-height: 1.1;
    }
    .sub {
        font-size: 14px;
        color: ${({ $sub }) => $sub};
        min-height: 1.4em;
    }
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(0, 0, 0, .1);
        color: ${({ $fg }) => $fg};
    }
    &:focus-visible {
        outline: 2px solid var(--dh-ink);
        outline-offset: 3px;
    }
    @media screen and (max-width: 640px){
        height: 104px;
        padding: 18px;
        .title {
            font-size: 22px;
        }
    }
`

interface TileDef {
    key: ProductKind | 'custom'
    label: string
    to: string
    bg: string
    fg: string
    sub: string
    dashed?: boolean
}

// Tinta, amarillo y sage son constantes de marca (brand/README): no siguen el tema.
const TILES: TileDef[] = [
    { key: 'polo', label: 'Polos', to: '/?cat=polo#catalogo', bg: '#1B1A17', fg: '#FAF6F1', sub: '#D8D2C8' },
    { key: 'mousepad', label: 'Mousepads', to: '/?cat=mousepad#catalogo', bg: '#E9B949', fg: '#1B1A17', sub: '#1B1A17' },
    { key: 'taza', label: 'Tazas', to: '/?cat=taza#catalogo', bg: '#CFE0D7', fg: '#1B1A17', sub: '#1B1A17' },
    { key: 'custom', label: 'Tu diseño', to: '/#personaliza', bg: 'var(--dh-surface)', fg: 'var(--dh-ink)', sub: 'var(--dh-ink)', dashed: true }
]

const countLabel = (count: number) => `${count} ${count === 1 ? 'diseño' : 'diseños'} →`
const subFor = (kind: ProductKind, count: number) => kind === 'polo' ? `Hombre y mujer · ${countLabel(count)}` : countLabel(count)

function CategoryTiles(): JSX.Element {
    const { loading, error } = useCatalogStatus()
    const products = useSelector((state: RootState) => state.products.products)
    const hasData = !loading && !error
    const countFor = (kind: ProductKind) => products.filter((product) => (product.type ?? 'polo') === kind).length

    return (
        <TilesGrid as="nav" aria-label="Categorías">
            {TILES.map((tile) => (
                <Tile key={tile.key} to={tile.to} $bg={tile.bg} $fg={tile.fg} $sub={tile.sub} $dashed={tile.dashed}>
                    <span className="title">{tile.label}</span>
                    <span className="sub">
                        {tile.key === 'custom'
                            ? `Desde S/ ${site.customization.fromPrice} →`
                            : hasData ? subFor(tile.key, countFor(tile.key)) : ''}
                    </span>
                </Tile>
            ))}
        </TilesGrid>
    )
}

export default CategoryTiles
