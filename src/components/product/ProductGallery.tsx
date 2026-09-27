import { TouchEvent, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import type { Cut, LogoPosition, ProductType } from '@/types/ProductType'
import ProductVisual from '@/components/ProductVisual'
import LikeProduct from '@/components/LikeProduct'
import FlipButton from '@/components/product/FlipButton'
import { isConfigured, site } from '@/config/site'

// Galería de la ficha (spec R5.2 / design §8.3, canvas Producto.dc.html):
// miniaturas verticales 84×100 (borde 2 tinta en la activa) "Frente" y
// "Espalda" siempre (mockup procedural según corte/color/posición del logo);
// "Foto con modelo" y "Detalle del estampado" solo si el producto trae imágenes
// (v1: no existen → ocultas). Imagen principal 660 alto, radio 24, --dh-sand,
// badge arriba-izq, favorito arriba-der (LikeProduct preservado). El flip de
// R0.2 y la miniatura activa se sincronizan en ambos sentidos. En ≤640 la
// galería es un carrusel (swipe) con dots.

type ViewId = 'front' | 'back' | `image-${number}`

interface GalleryView {
    id: ViewId
    label: string
    short: string
    src?: string
    isModelPhoto?: boolean
}

const Gallery = styled.div`
    display: flex;
    gap: 16px;
    .gallery_thumbs {
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex-shrink: 0;
        button {
            width: 84px;
            height: 100px;
            border-radius: 14px;
            border: 2px solid var(--dh-line);
            background: var(--dh-surface);
            color: var(--dh-muted);
            font-family: inherit;
            font-size: 11px;
            font-weight: 600;
            padding: 0;
            cursor: pointer;
            box-sizing: border-box;
            overflow: hidden;
            transition: border-color .15s ease;
            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }
            &:hover {
                border-color: var(--dh-line-2);
            }
            &[aria-pressed="true"] {
                border-color: var(--dh-ink);
                color: var(--dh-ink);
            }
            &:focus-visible {
                outline: 2px solid var(--dh-ink);
                outline-offset: 2px;
            }
        }
    }
    .gallery_stage {
        flex-grow: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .gallery_main {
        position: relative;
        height: 660px;
        border-radius: 24px;
        background: var(--dh-sand);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        touch-action: pan-y;
        picture {
            width: min(62%, 440px);
        }
        .gallery_photo {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }
    }
    .gallery_badge {
        position: absolute;
        left: 20px;
        top: 20px;
        z-index: 3;
        padding: 6px 12px;
        border-radius: 12px;
        background: #1B1A17;
        color: #FAF6F1;
        font-size: 13px;
        font-weight: 600;
        line-height: 1;
    }
    .gallery_caption {
        margin: 0;
        font-size: 13px;
        color: var(--dh-muted);
        text-align: center;
    }
    .gallery_dots {
        display: none;
    }
    @media screen and (max-width: 1024px) {
        flex-direction: column-reverse;
        .gallery_thumbs {
            flex-direction: row;
            button {
                width: 72px;
                height: 84px;
            }
        }
        .gallery_main {
            height: 520px;
        }
    }
    @media screen and (max-width: 640px) {
        .gallery_thumbs {
            display: none;
        }
        .gallery_main {
            height: 380px;
            border-radius: 20px;
            picture {
                width: min(70%, 300px);
            }
        }
        .gallery_dots {
            display: flex;
            justify-content: center;
            gap: 8px;
            button {
                width: 10px;
                height: 10px;
                padding: 0;
                border-radius: 5px;
                border: none;
                background: var(--dh-line-2);
                cursor: pointer;
                &[aria-pressed="true"] {
                    background: var(--dh-ink);
                }
            }
        }
    }
`

const SWIPE_THRESHOLD = 40

interface ProductGalleryProps {
    product: ProductType
    cut?: Cut
    color?: string
    logoPosition?: LogoPosition
    isFlipped: boolean
    onFlipChange: (flipped: boolean) => void
    /** Mostrar "Ver espalda/Ver frente" (posición de logo trasera, spec R0.2). */
    showFlipButton: boolean
    canFlip: boolean
    badge?: string | null
}

const viewsFor = (product: ProductType, canFlip: boolean): GalleryView[] => {
    const views: GalleryView[] = [{ id: 'front', label: 'Frente', short: 'Frente' }]
    if (canFlip) views.push({ id: 'back', label: 'Espalda', short: 'Espalda' })
    ;(product.images ?? []).forEach((image, index) => {
        const isModel = image.view === 'modelo'
        views.push({
            id: `image-${index}`,
            label: isModel ? 'Foto con modelo' : 'Detalle del estampado',
            short: isModel ? 'Foto' : 'Detalle',
            src: image.url,
            isModelPhoto: isModel
        })
    })
    return views
}

function ProductGallery({ product, cut, color, logoPosition, isFlipped, onFlipChange, showFlipButton, canFlip, badge }: ProductGalleryProps): JSX.Element {
    const views = viewsFor(product, canFlip)
    const [active, setActive] = useState<ViewId>(isFlipped ? 'back' : 'front')
    const touchStartX = useRef<number | null>(null)

    // Flip externo (botón "Ver espalda" o posición de logo trasera) → miniatura activa.
    useEffect(() => {
        setActive(isFlipped ? 'back' : 'front')
    }, [isFlipped, product.id])

    const select = (view: GalleryView) => {
        setActive(view.id)
        if (view.id === 'front') onFlipChange(false)
        if (view.id === 'back') onFlipChange(true)
    }

    const step = (delta: number) => {
        const index = views.findIndex((view) => view.id === active)
        const next = views[(index + delta + views.length) % views.length]
        if (next) select(next)
    }

    const onTouchStart = (event: TouchEvent) => {
        touchStartX.current = event.touches[0]?.clientX ?? null
    }
    const onTouchEnd = (event: TouchEvent) => {
        if (touchStartX.current === null || views.length < 2) return
        const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current
        touchStartX.current = null
        if (Math.abs(delta) < SWIPE_THRESHOLD) return
        step(delta < 0 ? 1 : -1)
    }

    const current = views.find((view) => view.id === active) ?? views[0]
    const showModelCaption = Boolean(current.isModelPhoto) && isConfigured('product.modelHeightCm') && isConfigured('product.modelSize')
    const hasThumbs = views.length > 1

    return (
        <Gallery>
            {hasThumbs && (
                <div className="gallery_thumbs" role="group" aria-label="Vistas del producto">
                    {views.map((view) => (
                        <button
                            key={view.id}
                            type="button"
                            aria-pressed={view.id === current.id}
                            aria-label={view.label}
                            title={view.label}
                            onClick={() => select(view)}
                        >
                            {view.src ? <img src={view.src} alt="" loading="lazy" /> : view.short}
                        </button>
                    ))}
                </div>
            )}
            <div className="gallery_stage">
                <div className="gallery_main" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                    {badge && <span className="gallery_badge">{badge}</span>}
                    <LikeProduct product={product} />
                    {current.src
                        ? <img className="gallery_photo" src={current.src} alt={`${product.name ?? 'Producto'} — ${current.label}`} />
                        : <ProductVisual product={product} color={color} logoPosition={logoPosition} isFlipped={isFlipped} cut={cut} />}
                    {showFlipButton && !current.src && <FlipButton isFlipped={isFlipped} onToggle={() => onFlipChange(!isFlipped)} />}
                </div>
                {showModelCaption && (
                    <p className="gallery_caption">Modelo mide {site.product.modelHeightCm} cm y usa talla {site.product.modelSize}</p>
                )}
                {hasThumbs && (
                    <div className="gallery_dots" role="group" aria-label="Vistas del producto">
                        {views.map((view) => (
                            <button
                                key={view.id}
                                type="button"
                                aria-pressed={view.id === current.id}
                                aria-label={view.label}
                                onClick={() => select(view)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Gallery>
    )
}

export default ProductGallery
