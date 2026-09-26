import ThemeSwitch from '@/components/ThemeSwitch'
import useOnClickOutside from '@/hooks/useOnClickOutside';
import { RootState } from '@/store';
import { useEffect, useRef, useState } from 'react';
import Lottie from 'react-lottie-player';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import Cart from './Cart';
import lottieJson from '@/assets/animations/like.json'
import addedSound from '@/assets/added.wav'
import { Link, useLocation } from 'react-router-dom';
import useDelayUnmount from '@/hooks/useDelayUnmount';
import { useRequestSearchFocus } from '@/components/SearchBox';
import { useMediaQuery } from 'usehooks-ts';

// Columna derecha del header (spec R2.2): "Sigue tu pedido" · buscar 44 ·
// favoritos 44 con contador · ThemeSwitch · pill "Carrito · N" → /cart.
// Conserva intactos el sonido `added.wav`, la animación Lottie y el dropdown
// del carrito (spec R0.2): el dropdown se abre al pasar el mouse por la pill
// en dispositivos con hover; el click siempre lleva a /cart.
const NavbarItemsWrapper = styled.ul`
	display: flex;
	align-items: center;
	gap: 12px;
	list-style: none;
	margin: 0;
	padding: 0;
	flex-shrink: 0;
	li {
		display: flex;
		align-items: center;
		&.tracking_link {
			margin-right: 4px;
			a {
				color: var(--dh-muted);
				font-size: 14px;
				text-decoration: none;
				white-space: nowrap;
				&:hover, &:focus-visible {
					color: var(--dh-ink);
				}
			}
		}
		.icon_button {
			position: relative;
			width: 44px;
			height: 44px;
			border-radius: 22px;
			border: 1px solid var(--dh-line);
			background: var(--dh-surface);
			color: var(--dh-ink);
			display: inline-flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			padding: 0;
			text-decoration: none;
			transition: border-color .15s ease;
			svg {
				width: 20px;
				height: 20px;
			}
			&:hover, &:focus-visible {
				border-color: var(--dh-ink);
			}
			&:focus-visible {
				outline: 2px solid var(--dh-ink);
				outline-offset: 2px;
			}
			.count {
				position: absolute;
				top: -4px;
				right: -4px;
				min-width: 18px;
				height: 18px;
				padding: 0 5px;
				border-radius: 9px;
				background: var(--dh-accent);
				color: #FAF6F1;
				font-size: 11px;
				font-weight: 700;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				box-sizing: border-box;
			}
		}
		&.cart_box {
			position: relative;
			.cart_pill {
				height: 44px;
				padding: 0 16px;
				border-radius: 22px;
				background: var(--dh-ink);
				color: var(--color-text-invert);
				display: inline-flex;
				align-items: center;
				gap: 8px;
				font-size: 14px;
				font-weight: 600;
				text-decoration: none;
				white-space: nowrap;
				transition: opacity .15s ease;
				svg {
					width: 18px;
					height: 18px;
				}
				&:hover {
					opacity: .9;
				}
				&:focus-visible {
					outline: 2px solid var(--dh-ink);
					outline-offset: 2px;
				}
			}
			.icon_sparkle {
				position: absolute;
				right: -28px;
				top: -28px;
				pointer-events: none;
			}
		}
	}
	@media screen and (max-width: 640px) {
		gap: 8px;
		li.tracking_link, li.search_item, li.favorites_item {
			display: none;
		}
		li.cart_box .cart_pill {
			padding: 0 12px;
			.cart_label {
				display: none;
			}
		}
	}
`

function NavbarItems(): JSX.Element {
	const location = useLocation()
	const audio = new Audio(addedSound)
	const cartRef = useRef(null);
	const closeTimer = useRef<number | undefined>(undefined)
	const [isOpen, setIsOpen] = useState(false)
	const [pathname, setPathname] = useState('')
	const [isAdded, setIsAdded] = useState(false)
	const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')
	const requestSearchFocus = useRequestSearchFocus()
	const { productsCart } = useSelector(
		(state: RootState) => state.cart
	)
	const { likedList } = useSelector(
		(state: RootState) => state.likes
	)
	useOnClickOutside(cartRef, () => setIsOpen(false))

	const playAddedSound = () => {
		if(productsCart.length > 0 ) audio.play()
	};

	useEffect(() => {
		setIsAdded(true)
		playAddedSound()
	}, [productsCart])

	useEffect(() => {
		setPathname(location.pathname)
		setIsOpen(false)
	}, [location])

	useEffect(() => () => window.clearTimeout(closeTimer.current), [])

	const openPreview = () => {
		if (!canHover || productsCart.length === 0) return
		window.clearTimeout(closeTimer.current)
		setIsOpen(true)
	}
	const scheduleClose = () => {
		if (!canHover) return
		window.clearTimeout(closeTimer.current)
		closeTimer.current = window.setTimeout(() => setIsOpen(false), 220)
	}

	const showDiv = useDelayUnmount(isOpen, 500);
	const cartCount = productsCart.length
	const favoritesCount = likedList.length

	return (
		<NavbarItemsWrapper>
			<li className='tracking_link'>
				<Link to='/pedido'>Sigue tu pedido</Link>
			</li>
			<li className='search_item'>
				<button type="button" className="icon_button" aria-label="Buscar" onClick={requestSearchFocus}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
				</button>
			</li>
			<li className='favorites_item'>
				<Link to='/favoritos' className="icon_button" aria-label={`Favoritos, ${favoritesCount} producto${favoritesCount === 1 ? '' : 's'}`}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
					{favoritesCount > 0 && <span className="count" aria-hidden="true">{favoritesCount}</span>}
				</Link>
			</li>
			<li>
				<ThemeSwitch />
			</li>
			<li className='cart_box' onMouseEnter={openPreview} onMouseLeave={scheduleClose}>
				<Link
					to='/cart'
					className="cart_pill"
					aria-label={`Carrito, ${cartCount} producto${cartCount === 1 ? '' : 's'}`}
					onClick={() => setIsOpen(false)}
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11h11L21 7H6.2" /><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /></svg>
					<span><span className="cart_label">Carrito · </span>{cartCount}</span>
				</Link>

				{showDiv && pathname !== '/cart' &&
					<Cart className={isOpen ? 'openIt' : 'closeIt'} innerRef={cartRef} />
				}

				{isAdded && productsCart.length > 0 &&
					<Lottie
						className="icon_sparkle"
						loop={false}
						animationData={lottieJson}
						play={isAdded}
						speed={1.2}
						style={{ width: 64, height: 64 }}
						rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
						onComplete={() => setIsAdded(false) }
					/>
				}
			</li>
		</NavbarItemsWrapper>
	);
}

export default NavbarItems
