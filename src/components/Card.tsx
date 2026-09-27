import styled from "styled-components"
import LikeProduct from "@/components/LikeProduct"
import ProductVisual from "@/components/ProductVisual"
import { Link } from "react-router-dom"
import { Cut, ProductCartActionType, ProductType } from "@/types/ProductType"
import { Dispatch, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store"
import { selectBestSellerIds } from "@/store/slices/products"
import { addToCart } from "@/store/slices/products/cart"
import { configFor } from "@/data/typeConfig"
import { logoPositionsFor } from "@/data/logoPositions"
import { displayColor } from "@/data/catalogFilters"
import { CUT_META, hasCut, onlyCutLabel, resolveCut } from "@/data/cuts"
import { defaultSizeFor } from "@/data/sizes"
import { isConfigured, site } from "@/config/site"

// Tarjeta de producto (spec 02 §3 / R3.6 / R4.6, canvas Home.dc.html): imagen 300
// en --dh-sand con la silueta del corte activo, badge "Agotado" (prioritario) /
// "Más vendido" (top 3 likes, C13) / "Nuevo" (< 30 días), favorito 44
// (LikeProduct preservado), puntos de color 14 (máx. 6, +N), nombre e imagen →
// ficha `/producto/{slug}` (+ `?corte=` activo si es polo, spec R5.7; sin
// `location.state`), meta por tipo (polos: `CUT_META` del corte activo o
// "Solo corte hombre"), precio Bricolage 20/700 y `+` 44 que agrega con
// corte/talla/color/posición por defecto SIN navegar (deshabilitado si `soldOut`).
const NEW_DAYS = 30
const MAX_DOTS = 6
const ADDED_FEEDBACK_MS = 1500

const CardWrapper = styled.article`
	display: flex;
	flex-direction: column;
	background-color: var(--dh-surface);
	border: 1px solid var(--dh-line);
	border-radius: var(--dh-radius-lg);
	overflow: hidden;
	position: relative;
	transition: transform .18s ease, box-shadow .18s ease;
	&:hover, &:focus-within {
		transform: translateY(-3px);
		box-shadow: 0 16px 36px rgba(0, 0, 0, .08);
	}
	&:hover .card_visual, &:focus-within .card_visual {
		transform: scale(1.04);
	}
`
const Badge = styled.span`
	position: absolute;
	top: 14px;
	left: 14px;
	z-index: 2;
	padding: 6px 10px;
	border-radius: 12px;
	background: #1B1A17;
	color: #FAF6F1;
	font-size: 12px;
	font-weight: 600;
	line-height: 1;
`
const CardImage = styled(Link)`
	all: unset;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 300px;
	width: 100%;
	background: var(--dh-sand);
	cursor: pointer;
	overflow: hidden;
	box-sizing: border-box;
	.card_visual {
		width: 64%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform .25s ease;
		picture {
			width: 100%;
		}
	}
	&:focus-visible {
		outline: 2px solid var(--dh-ink);
		outline-offset: -4px;
	}
	@media screen and (max-width: 1024px){
		height: 260px;
	}
	@media screen and (max-width: 640px){
		height: 180px;
		.card_visual {
			width: 74%;
		}
	}
`
const CardInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 16px 18px 18px;
	.dots {
		display: flex;
		align-items: center;
		gap: 6px;
		min-height: 14px;
		.dot {
			width: 14px;
			height: 14px;
			border-radius: 7px;
			border: 1px solid rgba(0, 0, 0, .18);
			box-sizing: border-box;
		}
		.more {
			font-size: 12px;
			color: var(--dh-muted);
		}
	}
	.name {
		all: unset;
		display: block;
		cursor: pointer;
		font-size: 16px;
		font-weight: 600;
		color: var(--dh-ink);
		line-height: 1.3;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		&:hover {
			color: var(--dh-accent);
		}
		&:focus-visible {
			outline: 2px solid var(--dh-ink);
			outline-offset: 2px;
			border-radius: 4px;
		}
	}
	.meta {
		font-size: 13px;
		color: var(--dh-muted);
		min-height: 1.3em;
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		padding-top: 4px;
	}
	.price {
		font-family: var(--dh-font-display);
		font-size: 20px;
		font-weight: 700;
		color: var(--dh-ink);
	}
	@media screen and (max-width: 640px){
		padding: 12px 12px 14px;
		gap: 6px;
		.name {
			font-size: 14px;
		}
		.price {
			font-size: 18px;
		}
	}
`
const AddButton = styled.button<{ $added: boolean }>`
	flex-shrink: 0;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 44px;
	height: 44px;
	border-radius: 22px;
	border: none;
	cursor: pointer;
	background: ${({ $added }) => $added ? 'var(--dh-green)' : 'var(--dh-accent)'};
	transition: transform .15s ease, background .2s ease;
	svg {
		width: 18px;
		height: 18px;
		stroke: #FFFFFF;
	}
	&:hover:not(:disabled) {
		background: ${({ $added }) => $added ? 'var(--dh-green)' : 'var(--dh-accent-hover)'};
		transform: scale(1.06);
	}
	&:disabled {
		background: var(--dh-line-2);
		cursor: not-allowed;
		svg {
			stroke: var(--dh-muted);
		}
	}
	&:focus-visible {
		outline: 2px solid var(--dh-ink);
		outline-offset: 2px;
	}
	@media screen and (max-width: 640px){
		width: 40px;
		height: 40px;
	}
`

const isNew = (createdAt?: string): boolean => {
	if (!createdAt) return false
	const time = Date.parse(createdAt)
	if (Number.isNaN(time)) return false
	return Date.now() - time < NEW_DAYS * 24 * 60 * 60 * 1000
}

/** Badge de tarjeta/ficha (spec R3.6 / R4.6 / R5.2): "Agotado" > "Más vendido" > "Nuevo". */
export const badgeFor = (product: ProductType, isBestSeller: boolean): string | null =>
	product.soldOut ? 'Agotado' : isBestSeller ? 'Más vendido' : isNew(product.createdAt) ? 'Nuevo' : null

/** Ruta de la ficha (spec R5.7): `/producto/{slug ?? id}` + `?corte=` activo si es polo. */
export const productPath = (product: ProductType, activeCut?: Cut): string => {
	const slug = encodeURIComponent(product.slug ?? product.id ?? '')
	const isPolo = (product.type ?? 'polo') === 'polo'
	return `/producto/${slug}${isPolo && activeCut ? `?corte=${activeCut}` : ''}`
}

/**
 * Meta 13px por tipo (spec R3.6 / R4.6): polo → `Hombre · corte recto · S–XXL` del
 * corte activo, o "Solo corte hombre" si el polo no existe en ese corte;
 * mousepad/taza → medida si está configurada.
 */
export const productMeta = (product: ProductType, cut: Cut): string => {
	const kind = product.type ?? 'polo'
	if (kind === 'polo') {
		return hasCut(product, cut) ? CUT_META[cut] : onlyCutLabel(product)
	}
	if (kind === 'mousepad') {
		return isConfigured('product.mousepadSize') ? `Mousepad · ${site.product.mousepadSize}` : 'Mousepad'
	}
	return isConfigured('product.mugMl') ? `Taza · ${site.product.mugMl} ml` : 'Taza'
}

function Card({ product }: { product: ProductType }): JSX.Element {
	const dispatch: Dispatch<any> = useDispatch()
	const bestSellerIds = useSelector(selectBestSellerIds)
	const filterColor = useSelector((state: RootState) => state.products.filters.color)
	const activeCut = useSelector((state: RootState) => state.products.filters.cut)
	const [added, setAdded] = useState(false)

	useEffect(() => {
		if (!added) return
		const timer = window.setTimeout(() => setAdded(false), ADDED_FEEDBACK_MS)
		return () => window.clearTimeout(timer)
	}, [added])

	const href = productPath(product, activeCut)
	const isBestSeller = product.id !== undefined && bestSellerIds.includes(product.id)
	const soldOut = Boolean(product.soldOut)
	// "Agotado" tiene prioridad sobre "Más vendido" y "Nuevo" (spec R4.6).
	const badge = badgeFor(product, isBestSeller)
	const colors = product.colors ?? []
	const color = displayColor(product, filterColor)
	const name = product.name ?? 'producto'

	// Agregar rápido (spec R3.6 / R4.6): corte activo si el polo lo tiene (si no su
	// único corte), talla M de la tabla del corte (si no la primera), color mostrado
	// (colors[0] o el filtrado), logo "chest" si aplica. Sonido/Lottie los dispara
	// NavbarItems al cambiar el carrito (spec R0.2). No navega. La línea del carrito
	// se deduplica por id+corte+color+talla+posición (sin `_id` aleatorio).
	const quickAdd = () => {
		if (soldOut) return
		const config = configFor(product)
		const cut = config.hasCuts ? resolveCut(product, activeCut) : undefined
		const size = config.hasSizes ? defaultSizeFor(cut ?? 'hombre') : undefined
		const positions = config.hasLogoPosition ? logoPositionsFor(product) : []
		const logoPosition = positions.length ? (positions.includes('chest') ? 'chest' : positions[0]) : undefined
		dispatch(addToCart({
			type: ProductCartActionType.ADD,
			product: { ...product, quantity: 1, cut, size, color, logoPosition }
		}))
		setAdded(true)
	}

	return (
		<CardWrapper>
			<CardImage to={href} aria-label={`Ver detalle de ${name}`}>
				{badge && <Badge>{badge}</Badge>}
				<div className="card_visual">
					<ProductVisual product={product} color={color} cut={activeCut} />
				</div>
			</CardImage>
			<LikeProduct product={product} />
			<CardInfo>
				<div className="dots" aria-label={colors.length ? `${colors.length} ${colors.length === 1 ? 'color' : 'colores'}` : undefined}>
					{colors.slice(0, MAX_DOTS).map((swatch) => (
						<span key={swatch} className="dot" style={{ background: swatch }} title={swatch} />
					))}
					{colors.length > MAX_DOTS && <span className="more">+{colors.length - MAX_DOTS}</span>}
				</div>
				<Link to={href} className="name">{product.name}</Link>
				<span className="meta">{productMeta(product, activeCut)}</span>
				<div className="row">
					<span className="price">S/ {product.price}</span>
					<AddButton
						type="button"
						$added={added}
						disabled={soldOut}
						aria-disabled={soldOut || undefined}
						aria-label={soldOut ? `${name} agotado` : added ? `${name} agregado al carrito` : `Agregar ${name} al carrito`}
						title={soldOut ? 'Agotado' : undefined}
						onClick={quickAdd}
					>
						{added
							? <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
							: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>}
					</AddButton>
				</div>
			</CardInfo>
		</CardWrapper>
	)
}

export default Card
