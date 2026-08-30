import { FormEvent, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import styled, { keyframes } from "styled-components"
import { ApiError, assetUrl } from "@/data/http"
import { nearestColorName } from "@/data/colorNames"
import { getOrderTracking, OrderTrackingDTO } from "@/data/OrderService"
import ProductVisual from "@/components/ProductVisual"
import StatusIllustration from "@/components/tracking/StatusIllustration"
import type { CartLogoPosition, ProductKind } from "@/types/ProductType"

const STATUS_FLOW = [
    { key: 'pendiente', label: 'Pendiente' },
    { key: 'confirmado', label: 'Confirmado' },
    { key: 'pagado', label: 'Pagado' },
    { key: 'preparado', label: 'Preparado' },
    { key: 'enviado', label: 'Enviado' },
    { key: 'recibido', label: 'Recibido' }
]

const TYPE_LABELS: Record<string, string> = {
    polo: 'Polo',
    taza: 'Taza',
    mousepad: 'Mousepad'
}

const LOGO_POSITION_LABELS: Record<string, string> = {
    'pocket': 'Bolsillo delantero',
    'chest': 'Pecho',
    'back': 'Espalda',
    'front-back': 'Bolsillo delantero + espalda',
    'back-chest': 'Bolsillo delantero + espalda'
}

const STATUS_MESSAGES: Record<string, string> = {
    pendiente: 'Tu pedido está registrado y a la espera de confirmación.',
    confirmado: 'Confirmamos tu pedido y ya estamos alistando todo.',
    pagado: 'Pago recibido. Pronto empezamos a preparar tu pedido.',
    preparado: 'Estamos armando y cosiendo tu pedido con cuidado.',
    enviado: 'Tu pedido va en camino hacia ti.',
    recibido: '¡Tu pedido fue entregado! Gracias por tu compra.'
}

const TrackingWrapper = styled.section`
    width: var(--screen-desktop);
    margin: 0 auto;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 25px;
    color: var(--color-text);
    @media screen and (max-width: 1024px){
        width: var(--screen-tablet);
    }
    @media screen and (max-width: 768px){
        width: var(--screen-phone);
    }
    @media screen and (max-width: 425px){
        width: calc(100% - 40px);
        margin: 0 20px;
        margin-bottom: 20px;
        gap: 20px;
    }
`

const SearchCard = styled.form`
    background-color: var(--color-neutral);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 40px 25px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    h1 {
        font-size: var(--font-size-title_sm);
        font-weight: 700;
    }
    p {
        opacity: .5;
        font-size: 15px;
        text-align: center;
        line-height: 1.3;
        max-width: 400px;
    }
    .search_controls {
        display: flex;
        gap: 10px;
        width: 100%;
        max-width: 420px;
        input {
            flex: 1;
            border: 1px solid var(--color-border-solid);
            background-color: transparent;
            border-radius: var(--button-radius);
            height: var(--button-height);
            padding: 0 20px;
            box-sizing: border-box;
            color: var(--color-text);
            text-transform: uppercase;
            letter-spacing: .05rem;
            min-width: 0;
        }
        button {
            border: none;
            background-color: var(--color-accent);
            border-radius: var(--button-radius);
            height: var(--button-height);
            padding: 0 25px;
            color: var(--color-text-invert);
            font-weight: 500;
            font-size: var(--font-size-text);
            cursor: pointer;
            white-space: nowrap;
        }
    }
    @media screen and (max-width: 425px){
        padding: 30px 20px;
        .search_controls {
            flex-direction: column;
        }
    }
`

const TrackingCard = styled.div`
    background-color: var(--color-neutral);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 25px;
    box-sizing: border-box;
    h1 {
        padding-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: .03rem;
        font-weight: 600;
        font-size: 13px;
        display: block;
        margin-bottom: 8px;
        opacity: .5;
    }
    .tracking_head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 25px;
        .tracking_code {
            font-size: var(--font-size-title_sm);
            font-weight: 700;
            letter-spacing: .05rem;
        }
        .tracking_date {
            font-size: 14px;
            opacity: .5;
        }
    }
    @media screen and (max-width: 425px){
        padding: 20px;
    }
`

const StatusHero = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 25px;
    .status_copy {
        flex: 1;
        h2 {
            font-size: var(--font-size-title_sm);
            font-weight: 700;
            margin-bottom: 4px;
        }
        p {
            opacity: .6;
            font-size: 14px;
            line-height: 1.4;
        }
    }
    @media screen and (max-width: 768px){
        flex-direction: column;
        text-align: center;
        gap: 10px;
    }
`

const Stepper = styled.ul`
    display: flex;
    margin-bottom: 25px;
    li {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        position: relative;
        .step_dot {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background-color: var(--color-neutral);
            border: 2px solid var(--color-border-solid);
            box-sizing: border-box;
            position: relative;
            z-index: 1;
        }
        .step_label {
            font-size: 13px;
            opacity: .5;
            text-align: center;
        }
        &:not(:first-child)::before {
            content: '';
            position: absolute;
            top: 6px;
            right: 50%;
            width: 100%;
            height: 2px;
            background-color: var(--color-border-solid);
        }
        &.completed {
            .step_dot {
                background-color: var(--color-accent);
                border-color: var(--color-accent);
            }
            &:not(:first-child)::before {
                background-color: var(--color-accent);
            }
        }
        &.current {
            .step_dot {
                background-color: var(--color-accent);
                border-color: var(--color-accent);
                box-shadow: 0 0 0 4px var(--color-accent-light);
            }
            .step_label {
                opacity: 1;
                font-weight: 600;
            }
            &:not(:first-child)::before {
                background-color: var(--color-accent);
            }
        }
    }
    @media screen and (max-width: 768px){
        flex-direction: column;
        align-items: flex-start;
        gap: 0;
        li {
            flex-direction: row;
            align-items: center;
            padding: 8px 0;
            .step_label {
                text-align: left;
            }
            &:not(:first-child)::before {
                top: -8px;
                left: 6px;
                right: auto;
                width: 2px;
                height: 16px;
            }
        }
    }
`

const CancelledBanner = styled.div`
    background-color: var(--color-warning-light);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 20px 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 4px;
    margin-bottom: 25px;
    b {
        font-weight: 600;
        font-size: 15px;
        display: block;
        margin-bottom: 2px;
    }
    p {
        font-size: 13px;
        opacity: .7;
        max-width: 340px;
    }
`

const FinalizadoCard = styled.div`
    background-color: var(--color-neutral);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 50px 25px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 6px;
    h1 {
        font-size: var(--font-size-title_sm);
        font-weight: 700;
        margin-top: 12px;
    }
    .finalizado_code {
        font-size: 14px;
        font-weight: 600;
        letter-spacing: .08rem;
        text-transform: uppercase;
        opacity: .5;
    }
    p {
        opacity: .6;
        font-size: 15px;
        line-height: 1.4;
        max-width: 380px;
        margin-top: 4px;
    }
    a {
        margin-top: 18px;
        font-size: 14px;
        font-weight: 500;
        color: var(--color-accent);
        text-decoration: underline;
        text-underline-offset: 3px;
    }
    @media screen and (max-width: 425px){
        padding: 40px 20px;
    }
`

const ItemList = styled.ul`
    li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        padding: 12px 0;
        border-bottom: 1px solid var(--color-border-dark);
        .item_thumb {
            width: 68px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            /* The type visuals (TShirt/Mug/Mousepad) are styled <picture>
               wrappers with a large default width — same override trick as
               ProductCart to render them as small thumbnails. */
            picture {
                width: 68px;
            }
        }
        .item_detail {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;
            b {
                font-weight: 600;
                font-size: 15px;
            }
            .item_chips {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 6px;
                span {
                    font-size: 12px;
                    padding: 3px 10px;
                    border-radius: var(--button-radius);
                    border: 1px solid var(--color-border-solid);
                    opacity: .7;
                }
                span.color_chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 2px 8px;
                    i {
                        display: block;
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        border: 1px solid rgba(0, 0, 0, .2);
                        box-sizing: border-box;
                    }
                }
            }
        }
        .item_quantity {
            font-size: 14px;
            opacity: .5;
            white-space: nowrap;
        }
        &.total {
            border-bottom: none;
            padding-bottom: 0;
            b {
                font-weight: 600;
                font-size: var(--font-size-price);
            }
        }
    }
    @media screen and (max-width: 425px){
        li {
            gap: 10px;
            .item_thumb {
                width: 56px;
                picture {
                    width: 56px;
                }
            }
        }
    }
`

const NotFoundCard = styled.div`
    background-color: var(--color-neutral);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 40px 25px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    svg {
        fill: var(--color-accent);
        width: 36px;
        height: 36px;
    }
    h1 {
        font-size: 16px;
        font-weight: 700;
        margin-top: 10px;
    }
    p {
        opacity: .5;
        font-size: 15px;
        text-align: center;
        max-width: 400px;
        line-height: 1.3;
    }
`

const spin = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
`

const LoadingCard = styled.div`
    background-color: var(--color-neutral);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 60px 25px;
    display: flex;
    justify-content: center;
    .spinner {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid var(--color-accent);
        border-bottom: 2px solid transparent;
        animation: ${spin} .6s linear infinite;
    }
`

const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
}

const typeLabel = (type: string): string => TYPE_LABELS[type] ?? type

const PRODUCT_KINDS: ProductKind[] = ['polo', 'taza', 'mousepad']

// The API sends `type` as a plain string; unknown values fall back to the
// polo silhouette inside configFor, same as everywhere else in the store.
const toProductKind = (type: string): ProductKind | undefined =>
    PRODUCT_KINDS.indexOf(type as ProductKind) >= 0 ? type as ProductKind : undefined

const logoPositionLabel = (position?: string): string | undefined =>
    position ? LOGO_POSITION_LABELS[position] ?? position : undefined

function TrackingSearch({ compact }: { compact?: boolean }): JSX.Element {
    const navigate = useNavigate()
    const [code, setCode] = useState('')

    const searchOrder = (event: FormEvent) => {
        event.preventDefault()
        const cleanCode = code.trim().toUpperCase()
        if (!cleanCode) return
        navigate(`/pedido/${cleanCode}`)
    }

    return (
        <SearchCard onSubmit={searchOrder}>
            {!compact && <h1>Sigue tu pedido</h1>}
            {!compact &&
                <p>Ingresa el código que recibiste al confirmar tu pedido para ver su estado.</p>
            }
            <div className="search_controls">
                <input
                    type="text"
                    placeholder="Ingresa tu código de pedido"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                />
                <button type="submit">Buscar</button>
            </div>
        </SearchCard>
    )
}

function Tracking(): JSX.Element {
    const { id } = useParams()
    const [tracking, setTracking] = useState<OrderTrackingDTO | null>(null)
    const [loading, setLoading] = useState(false)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        if (!id) {
            setTracking(null)
            setNotFound(false)
            return
        }
        let cancelled = false
        setLoading(true)
        setNotFound(false)
        setTracking(null)
        getOrderTracking(id)
            .then((order) => {
                if (!cancelled) setTracking(order)
            })
            .catch((err) => {
                if (cancelled) return
                if (err instanceof ApiError && err.status === 404) {
                    setNotFound(true)
                } else {
                    console.error(err)
                    setNotFound(true)
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [id])

    const currentStep = tracking
        ? STATUS_FLOW.findIndex(step => step.key === tracking.status)
        : -1
    const isCancelled = tracking?.status === 'cancelado'
    const isFinalizado = tracking?.status === 'finalizado'

    return (
        <TrackingWrapper>
            {!id && <TrackingSearch />}

            {id && loading &&
                <LoadingCard>
                    <div className="spinner"></div>
                </LoadingCard>
            }

            {id && !loading && notFound &&
                <>
                    <NotFoundCard>
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 256 256"><path d="M232.5 71.3h-.1a16.4 16.4 0 0 0-6.4-6.4l-88-49.5a16.2 16.2 0 0 0-15.7 0L34.2 64.9a16.4 16.4 0 0 0-6.4 6.4h-.1a16.3 16.3 0 0 0-2 7.9v97.6a16.2 16.2 0 0 0 8.2 14l88 49.5a16 16 0 0 0 15.7 0l88-49.5a16.2 16.2 0 0 0 8.2-14V79.2a16.3 16.3 0 0 0-1.3-7.9ZM128 29.2L207.9 74L128 118.9L48.1 74Zm-88 58.5l80 45v89.6l-80-45Zm96 134.6v-89.6l80-45v89.6Z" /></svg>
                        <h1>No encontramos ese pedido</h1>
                        <p>Revisa que el código <strong>"{id}"</strong> sea correcto e intenta de nuevo.</p>
                    </NotFoundCard>
                    <TrackingSearch compact />
                </>
            }

            {id && !loading && tracking && isFinalizado &&
                <FinalizadoCard>
                    <StatusIllustration status="finalizado" />
                    <h1>Pedido finalizado</h1>
                    <span className="finalizado_code">{tracking.id}</span>
                    <p>¡Gracias por tu compra! Fue un gusto atenderte, esperamos verte pronto.</p>
                    <Link to="/">Seguir comprando</Link>
                </FinalizadoCard>
            }

            {id && !loading && tracking && !isFinalizado &&
                <TrackingCard>
                    <h1>Seguimiento de pedido</h1>
                    <div className="tracking_head">
                        <span className="tracking_code">{tracking.id}</span>
                        <span className="tracking_date">{formatDate(tracking.createdAt)}</span>
                    </div>

                    {isCancelled &&
                        <CancelledBanner>
                            <StatusIllustration status="cancelado" />
                            <div>
                                <b>Pedido cancelado</b>
                                <p>Este pedido fue cancelado. Si crees que es un error, escríbenos por WhatsApp.</p>
                            </div>
                        </CancelledBanner>
                    }

                    {!isCancelled &&
                        <StatusHero>
                            <StatusIllustration status={tracking.status} />
                            <div className="status_copy">
                                <h2>{STATUS_FLOW[currentStep]?.label ?? 'Seguimiento'}</h2>
                                <p>{STATUS_MESSAGES[tracking.status] ?? 'Estamos procesando tu pedido.'}</p>
                            </div>
                        </StatusHero>
                    }

                    {!isCancelled &&
                        <Stepper>
                            {STATUS_FLOW.map((step, index) => (
                                <li
                                    key={step.key}
                                    className={
                                        index < currentStep
                                            ? 'completed'
                                            : index === currentStep ? 'current' : ''
                                    }
                                >
                                    <div className="step_dot"></div>
                                    <span className="step_label">{step.label}</span>
                                </li>
                            ))}
                        </Stepper>
                    }

                    <ItemList>
                        {(tracking.items ?? []).map((item, index) => {
                            const logoLabel = logoPositionLabel(item.logoPosition)
                            const colorName = nearestColorName(item.color)
                            // Only admin-uploaded '/uploads/...' artwork is
                            // authoritative. Absolute item.logo URLs are legacy
                            // remote images (often a dead Firebase bucket), so
                            // they go through the `image` slot instead and rank
                            // behind the bundled local SVGs in getProductImage:
                            // logo → getProductLogo(name) → image → ''.
                            const uploadedLogo = item.logo && item.logo.startsWith('/')
                                ? assetUrl(item.logo)
                                : undefined
                            const legacyImage = uploadedLogo ? undefined : item.logo
                            return (
                                <li key={index}>
                                    <div className="item_thumb" aria-hidden="true">
                                        <ProductVisual
                                            product={{
                                                name: item.name,
                                                type: toProductKind(item.type),
                                                logo: uploadedLogo,
                                                image: legacyImage
                                            }}
                                            color={item.color}
                                            logoPosition={item.logoPosition as CartLogoPosition | undefined}
                                        />
                                    </div>
                                    <div className="item_detail">
                                        <b>{item.name}</b>
                                        <div className="item_chips">
                                            <span>{typeLabel(item.type)}</span>
                                            {item.size && <span>Talla {item.size}</span>}
                                            {item.color &&
                                                <span className="color_chip" title={item.color}>
                                                    <i style={{ backgroundColor: item.color }}></i>
                                                    {colorName}
                                                </span>
                                            }
                                            {logoLabel && <span>{logoLabel}</span>}
                                        </div>
                                    </div>
                                    <span className="item_quantity">x {item.quantity}</span>
                                </li>
                            )
                        })}
                        {tracking.total != null &&
                            <li className="total">
                                <p>Total</p>
                                <b>S/ {tracking.total}</b>
                            </li>
                        }
                    </ItemList>
                </TrackingCard>
            }
        </TrackingWrapper>
    )
}

export default Tracking
