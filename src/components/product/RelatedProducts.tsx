import { useSelector } from 'react-redux'
import styled from 'styled-components'
import Card from '@/components/Card'
import { RootState } from '@/store'
import type { ProductType } from '@/types/ProductType'

// "Completa el setup" (spec R5.6 / design §8.3, canvas): 4 productos del mismo
// tipo desde `state.products.products` (el catálogo ya cargado en App; sin
// endpoint nuevo), relleno con otros tipos si faltan, `likes` desc, excluyendo el
// actual; con la tarjeta de R3.6. Grid 4 → 2 (≤1024). Sin candidatos no se renderiza.
export const RELATED_COUNT = 4

const byLikes = (a: ProductType, b: ProductType): number =>
    ((b.likes ?? 0) - (a.likes ?? 0)) || (a.name ?? '').localeCompare(b.name ?? '')

export function pickRelated(products: ProductType[], current: ProductType, count = RELATED_COUNT): ProductType[] {
    const kind = current.type ?? 'polo'
    const others = products.filter((product) => product.id !== undefined && product.id !== current.id && product.published !== false)
    const sameKind = others.filter((product) => (product.type ?? 'polo') === kind).sort(byLikes)
    const otherKinds = others.filter((product) => (product.type ?? 'polo') !== kind).sort(byLikes)
    return [...sameKind, ...otherKinds].slice(0, count)
}

const Section = styled.section`
    padding-top: 72px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    h2 {
        margin: 0;
        font-family: var(--dh-font-display);
        font-size: 32px;
        font-weight: 800;
        letter-spacing: -0.02em;
        line-height: 1.1;
        color: var(--dh-ink);
    }
    .related_grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 20px;
    }
    @media screen and (max-width: 1024px) {
        padding-top: 56px;
        .related_grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }
    @media screen and (max-width: 640px) {
        padding-top: 40px;
        h2 {
            font-size: 26px;
        }
        .related_grid {
            gap: 12px;
        }
    }
`

function RelatedProducts({ product }: { product: ProductType }): JSX.Element | null {
    const products = useSelector((state: RootState) => state.products.products)
    const related = pickRelated(products, product)
    if (related.length === 0) return null
    return (
        <Section aria-labelledby="related-title">
            <h2 id="related-title">Completa el setup</h2>
            <div className="related_grid">
                {related.map((item) => <Card key={item.id} product={item} />)}
            </div>
        </Section>
    )
}

export default RelatedProducts
