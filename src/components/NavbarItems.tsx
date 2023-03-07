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

const NavbarItemsWrapper = styled.ul`
	display: flex;
	align-items: center;
	gap: 20px;
	li {
		& > svg {
			fill: var(--color-text);
			width: 28px;
			height: 28px;
		}
		&.cart_box {
			position: relative;
			.badge {
				pointer-events: none;
				user-select: none;
				position: absolute;
				top: -5px;
				right: -5px;
				background-color: var(--color-accent);
				width: 18px;
				height: 18px;
				border-radius: 50%;
				color: var(--color-text-invert);
				font-size: 12px;
				display: flex;
				align-items: center;
				justify-content: center;
				z-index: 2;
			}
			.icon_sparkle {
				position: absolute;
				right: -28px;
    			top: -28px;
				pointer-events: none;
			}
			svg {
				cursor: pointer;
			}
		}
	}
`

function NavbarItems(): JSX.Element {
	const audio = new Audio(addedSound)
	const cartRef = useRef(null);
	const [isOpen, setIsOpen] = useState(false)
	const [isAdded, setIsAdded] = useState(false)
	const { productsCart } = useSelector(
		(state: RootState) => state.cart
	)
	useOnClickOutside(cartRef, () => setIsOpen(false))

	const playAddedSound = () => {
		audio.play()
	};

	useEffect(() => {
		setIsAdded(true)
		playAddedSound()
	}, [productsCart])
	return (
		<NavbarItemsWrapper>
			<li>
				<ThemeSwitch />
			</li>
			<li className='cart_box'>
				<svg onClick={ () => setIsOpen(!isOpen) } preserveAspectRatio= "xMidYMid meet" viewBox = "0 0 256 256" > <path d="M94 216a14 14 0 1 1-14-14a14 14 0 0 1 14 14Zm90-14a14 14 0 1 0 14 14a14 14 0 0 0-14-14Zm43.5-128.4L201.1 166a22.2 22.2 0 0 1-21.2 16H84.1a22.2 22.2 0 0 1-21.2-16L36.5 73.8v-.3l-9.8-34a1.9 1.9 0 0 0-1.9-1.5H8a6 6 0 0 1 0-12h16.8a14.1 14.1 0 0 1 13.5 10.2L46.8 66h174.9a6 6 0 0 1 4.8 2.4a6 6 0 0 1 1 5.2ZM213.8 78H50.2l24.3 84.7a10 10 0 0 0 9.6 7.3h95.8a10 10 0 0 0 9.6-7.3Z" > </path></svg >
				{isOpen && <Cart innerRef={cartRef} />}
				
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
				
				{ productsCart.length > 0 &&
					<div className="badge">
						{productsCart.length}
					</div>
				}
				
			</li>
		</NavbarItemsWrapper>
	);
}

export default NavbarItems