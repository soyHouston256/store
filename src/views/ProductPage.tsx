import { Dispatch, useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import Container from '@/components/layout/Container'
import Accordion from '@/components/Accordion'
import { badgeFor, productMeta } from '@/components/Card'
import ProductGallery from '@/components/product/ProductGallery'
import CutSelector from '@/components/product/CutSelector'
import ColorSwatches, { colorName } from '@/components/product/ColorSwatches'
import LogoPositionPicker from '@/components/product/LogoPositionPicker'
import SizePills from '@/components/product/SizePills'
import QuantityStepper from '@/components/product/QuantityStepper'
import AddToCartButton, { ADDED_FEEDBACK_MS, AddToCartState, formatPrice } from '@/components/product/AddToCartButton'
import StickyBuyBar, { STICKY_BAR_HEIGHT } from '@/components/product/StickyBuyBar'
import RelatedProducts from '@/components/product/RelatedProducts'
import { DeliveryBox, priceNote, productAccordionItems } from '@/components/product/ProductInfo'
import { serializeSelection, useProductSelection } from '@/components/product/useProductSelection'
import useProduct from '@/hooks/useProduct'
import useProductUrlState from '@/hooks/useProductUrlState'
import useProductSeo from '@/hooks/useProductSeo'
import { RootState } from '@/store'
import { selectBestSellerIds } from '@/store/slices/products'
import { addToCart } from '@/store/slices/products/cart'
import { ProductCartActionType, ProductType } from '@/types/ProductType'
import { CATEGORY_OPTIONS } from '@/data/catalogFilters'
import { CUT_SHORT_LABELS } from '@/data/cuts'
import { isBackLogoPosition } from '@/data/logoPositions'
import { buildWhatsappUrl } from '@/data/whatsapp'
import { isConfigured, site } from '@/config/site'

// Ficha de producto `/producto/:slug` (spec 03 / R5.x, design §8.3, canvas
// Producto.dc.html). Página completa (no modal) con `Container`: breadcrumb →
// galería 640 + columna de compra (orden de R5.3) → "Completa el setup". La
// selección vive en `useProductSelection` (logo position + flip preservados,
// spec R0.2) y se refleja en la URL (`useProductUrlState`); SEO en
// `useProductSeo`. Sonido/Lottie los dispara NavbarItems al cambiar el carrito.

const Page = styled(Container)`
    padding-top: 20px;
    padding-bottom: var(--dh-section-y);
    color: var(--dh-ink);
    @media screen and (max-width: 640px) {
        padding-bottom: calc(48px + ${STICKY_BAR_HEIGHT}px);
    }
`
const Breadcrumb = styled.nav`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
    font-size: 13px;
    color: var(--dh-muted);
    ol {
        display: contents;
        list-style: none;
        margin: 0;
        padding: 0;
    }
    li {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        &::after {
            content: '/';
            color: var(--dh-line-2);
        }
        &:last-child::after {
            content: none;
        }
    }
    a {
        color: var(--dh-muted);
        text-decoration: none;
        &:hover, &:focus-visible {
            color: var(--dh-ink);
        }
    }
    [aria-current="page"] {
        color: var(--dh-ink);
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`
const Layout = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 640px) minmax(0, 1fr);
    gap: 56px;
    align-items: start;
    @media screen and (max-width: 1280px) {
        gap: 40px;
    }
    @media screen and (max-width: 1024px) {
        grid-template-columns: minmax(0, 1fr);
        gap: 32px;
    }
`
const Buy = styled.div`
    display: flex;
    flex-direction: column;
    gap: 22px;
    min-width: 0;
    .buy_title {
        display: flex;
        flex-direction: column;
        gap: 8px;
        h1 {
            margin: 0;
            font-family: var(--dh-font-display);
            font-size: 40px;
            font-weight: 800;
            letter-spacing: -0.02em;
            line-height: 1.05;
            overflow-wrap: anywhere;
        }
        .buy_meta {
            font-size: 14px;
            color: var(--dh-muted);
        }
    }
    .buy_price {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 12px;
        .price {
            font-family: var(--dh-font-display);
            font-size: 34px;
            font-weight: 700;
            line-height: 1;
        }
        .note {
            font-size: 14px;
            color: var(--dh-muted);
        }
    }
    .buy_actions {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .buy_whatsapp {
        height: 52px;
        border-radius: 26px;
        border: 1.5px solid var(--dh-ink);
        color: var(--dh-ink);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        font-size: 16px;
        font-weight: 600;
        text-decoration: none;
        box-sizing: border-box;
        transition: background .15s ease, color .15s ease;
        svg {
            width: 18px;
            height: 18px;
            stroke: currentColor;
        }
        &:hover {
            background: var(--dh-ink);
            color: var(--color-text-invert);
        }
        &:focus-visible {
            outline: 2px solid var(--dh-ink);
            outline-offset: 2px;
        }
    }
    .buy_accordion {
        border-top: 1px solid var(--dh-line);
        .accordion_trigger {
            min-height: 56px;
            font-size: 16px;
        }
        .accordion_panel {
            font-size: 14px;
            line-height: 1.65;
        }
    }
    @media screen and (max-width: 640px) {
        gap: 20px;
        .buy_title h1 {
            font-size: 30px;
        }
        .buy_price .price {
            font-size: 28px;
        }
        .buy_actions {
            flex-wrap: wrap;
        }
        .buy_whatsapp {
            font-size: 15px;
        }
    }
`
const StateBox = styled.div`
    margin: 40px auto;
    max-width: 560px;
    text-align: center;
    padding: 48px 24px;
    background: var(--dh-surface);
    border: 1px solid var(--dh-line);
    border-radius: var(--dh-radius-lg);
    h1 {
        margin: 0 0 8px;
        font-family: var(--dh-font-display);
        font-size: var(--dh-text-h3);
        font-weight: 700;
        color: var(--dh-ink);
    }
    p {
        margin: 0 0 20px;
        color: var(--dh-muted);
        font-size: 15px;
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
const Skeleton = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 640px) minmax(0, 1fr);
    gap: 56px;
    .sk_image, .sk_line {
        background: var(--dh-sand);
        border-radius: 24px;
        animation: pulse 1.1s ease-in-out infinite;
    }
    .sk_image {
        height: 660px;
    }
    .sk_line {
        height: 24px;
        border-radius: 8px;
        margin-bottom: 16px;
        &.wide { width: 80%; height: 40px; }
        &.short { width: 40%; }
    }
    @keyframes pulse {
        0%, 100% { opacity: .55; }
        50% { opacity: 1; }
    }
    @media screen and (max-width: 1024px) {
        grid-template-columns: 1fr;
        gap: 32px;
        .sk_image { height: 420px; }
    }
`

const kindLabel = (product: ProductType): string =>
    CATEGORY_OPTIONS.find((option) => option.key === (product.type ?? 'polo'))?.label ?? 'Productos'

/** Mensaje de WhatsApp (design §8.3): producto, corte, color y talla presentes. */
const customizeMessage = (product: ProductType, parts: { cut?: string; color?: string; size?: string }): string => {
    const details: string[] = []
    if (parts.cut) details.push(`corte ${parts.cut}`)
    if (parts.color) details.push(`color ${parts.color}`)
    if (parts.size) details.push(`talla ${parts.size}`)
    const suffix = details.length ? ` (${details.join(', ')})` : ''
    return `Hola devhaus.pe, quiero personalizar "${product.name ?? 'este diseño'}"${suffix}`
}

function ProductPage(): JSX.Element {
    const { slug } = useParams()
    const dispatch: Dispatch<any> = useDispatch()
    const { product: fetched, loading, error, notFound } = useProduct(slug)
    const catalog = useSelector((state: RootState) => state.products.products)
    const bestSellerIds = useSelector(selectBestSellerIds)

    // Mientras llega la API se usa el producto del catálogo ya cargado (mismo id →
    // la selección no se reinicia). Los likes se leen del catálogo para que el
    // contador siga vivo tras pulsar el corazón (LikeProduct actualiza el store).
    const cached = !notFound ? catalog.find((item) => item.slug === slug || item.id === slug) : undefined
    const product = fetched ?? cached
    const live = product ? catalog.find((item) => item.id === product.id) : undefined
    const likes = live?.likes ?? product?.likes ?? 0

    const selection = useProductSelection(product)
    useProductUrlState(product, selection)
    useProductSeo(product)

    const [added, setAdded] = useState(false)
    const [trigger, setTrigger] = useState(false)
    const serialized = serializeSelection(selection)

    useEffect(() => {
        if (!added) return
        const timer = window.setTimeout(() => setAdded(false), ADDED_FEEDBACK_MS)
        return () => window.clearTimeout(timer)
    }, [added])

    // "Agregado ✓" dura 3 s o hasta cambiar la selección (spec R5.3).
    useEffect(() => {
        setAdded(false)
    }, [serialized, selection.quantity, product?.id])

    const handleAdd = useCallback(() => {
        const item = selection.toCartItem()
        if (!item) {
            setTrigger(true)
            return
        }
        dispatch(addToCart({ type: ProductCartActionType.SUM, product: item }))
        setTrigger(false)
        setAdded(true)
    }, [dispatch, selection])

    if (!product) {
        if (loading) {
            return (
                <Page as="article" aria-busy="true">
                    <Skeleton>
                        <div className="sk_image" />
                        <div>
                            <div className="sk_line wide" />
                            <div className="sk_line short" />
                            <div className="sk_line" />
                            <div className="sk_line" />
                        </div>
                    </Skeleton>
                </Page>
            )
        }
        return (
            <Page as="article">
                <StateBox role={error ? 'alert' : undefined}>
                    <h1>{error ? 'No pudimos cargar el producto' : 'No encontramos ese producto'}</h1>
                    <p>{error ?? 'Puede que ya no esté disponible o que el enlace esté mal escrito.'}</p>
                    <Link to="/#catalogo">Ver catálogo</Link>
                </StateBox>
            </Page>
        )
    }

    const { config, soldOut, cut, color, size, logoPosition, isFlipped, quantity } = selection
    const price = product.price ?? 0
    const total = price * quantity
    const ctaState: AddToCartState = soldOut ? 'soldOut' : added ? 'added' : 'idle'
    const isMissing = (field: 'cut' | 'size' | 'logoPosition') => trigger && selection.missingFields.includes(field)
    const badge = badgeFor(product, product.id !== undefined && bestSellerIds.includes(product.id))

    const metaParts: string[] = []
    if (config.hasCuts) {
        if (cut) metaParts.push(productMeta(product, cut))
    } else {
        metaParts.push(productMeta(product, 'hombre'))
    }
    if (isConfigured('product.material')) metaParts.push(site.product.material as string)
    if (site.product.showSku && product.id) metaParts.push(`SKU ${product.id}`)
    if (likes > 0) metaParts.push(`${likes} ${likes === 1 ? 'favorito' : 'favoritos'}`)

    const whatsappHref = buildWhatsappUrl(customizeMessage(product, {
        cut: cut ? CUT_SHORT_LABELS[cut] : undefined,
        color: colorName(color),
        size
    }))

    return (
        <Page as="article" aria-labelledby="product-title">
            <Breadcrumb aria-label="Ruta de navegación">
                <ol>
                    <li><Link to="/">Inicio</Link></li>
                    <li><Link to={`/?cat=${product.type ?? 'polo'}`}>{kindLabel(product)}</Link></li>
                    <li><span aria-current="page">{product.name}</span></li>
                </ol>
            </Breadcrumb>

            <Layout>
                <ProductGallery
                    product={product}
                    cut={cut}
                    color={color}
                    logoPosition={logoPosition}
                    isFlipped={isFlipped}
                    onFlipChange={selection.setFlipped}
                    canFlip={config.canFlip}
                    showFlipButton={config.canFlip && isBackLogoPosition(logoPosition)}
                    badge={badge}
                />

                <Buy>
                    <div className="buy_title">
                        <h1 id="product-title">{product.name}</h1>
                        {metaParts.length > 0 && <div className="buy_meta">{metaParts.join(' · ')}</div>}
                    </div>

                    <div className="buy_price">
                        <span className="price">{formatPrice(price)}</span>
                        <span className="note">{priceNote()}</span>
                    </div>

                    {config.hasCuts && (
                        <CutSelector cuts={selection.availableCuts} value={cut} onChange={selection.selectCut} required={isMissing('cut')} />
                    )}
                    {config.hasColors && (
                        <ColorSwatches colors={product.colors ?? []} value={color} onChange={selection.selectColor} />
                    )}
                    {config.hasLogoPosition && (
                        <LogoPositionPicker
                            positions={selection.availableLogoPositions}
                            value={logoPosition}
                            onChange={selection.selectLogoPosition}
                            required={isMissing('logoPosition')}
                        />
                    )}
                    {config.hasSizes && (
                        <SizePills
                            sizes={selection.availableSizes}
                            value={size}
                            onChange={selection.selectSize}
                            cut={cut}
                            soldOut={soldOut}
                            required={isMissing('size')}
                        />
                    )}

                    <div className="buy_actions">
                        <QuantityStepper value={quantity} onIncrement={selection.increment} onDecrement={selection.decrement} />
                        <AddToCartButton state={ctaState} total={total} onAdd={handleAdd} />
                    </div>

                    {whatsappHref && (
                        <a className="buy_whatsapp" href={whatsappHref} target="_blank" rel="noreferrer">
                            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" /></svg>
                            Personalizar este diseño por WhatsApp
                        </a>
                    )}

                    <DeliveryBox />

                    <div className="buy_accordion">
                        <Accordion items={productAccordionItems(product)} />
                    </div>
                </Buy>
            </Layout>

            <RelatedProducts product={product} />

            <StickyBuyBar unitPrice={price} quantity={quantity} state={ctaState} onAdd={handleAdd} />
        </Page>
    )
}

export default ProductPage
