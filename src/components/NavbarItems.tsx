import ThemeSwitch from '@/components/ThemeSwitch'
import useOnClickOutside from '@/hooks/useOnClickOutside';
import { RootState } from '@/store';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import Cart from './Cart';

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
			}
			svg {
				cursor: pointer;
			}
		}
	}
`

function NavbarItems(): JSX.Element {
	const cartRef = useRef(null);
	const [isOpen, setIsOpen] = useState(false)
	const { list: products } = useSelector(
		(state: RootState) => state.products
	)
	useOnClickOutside(cartRef, () => setIsOpen(false))
	return (
		<NavbarItemsWrapper>
			<li>
				<ThemeSwitch />
			</li>
			<li className='cart_box'>
				<svg onClick={ () => setIsOpen(!isOpen) } preserveAspectRatio= "xMidYMid meet" viewBox = "0 0 256 256" > <path d="M94 216a14 14 0 1 1-14-14a14 14 0 0 1 14 14Zm90-14a14 14 0 1 0 14 14a14 14 0 0 0-14-14Zm43.5-128.4L201.1 166a22.2 22.2 0 0 1-21.2 16H84.1a22.2 22.2 0 0 1-21.2-16L36.5 73.8v-.3l-9.8-34a1.9 1.9 0 0 0-1.9-1.5H8a6 6 0 0 1 0-12h16.8a14.1 14.1 0 0 1 13.5 10.2L46.8 66h174.9a6 6 0 0 1 4.8 2.4a6 6 0 0 1 1 5.2ZM213.8 78H50.2l24.3 84.7a10 10 0 0 0 9.6 7.3h95.8a10 10 0 0 0 9.6-7.3Z" > </path></svg >
				{isOpen && <Cart innerRef={cartRef} /> }
				{ products.length > 0 &&
					<div className="badge">
						{ products.length }
					</div>
				}
			</li>
		</NavbarItemsWrapper>
	);
}

export default NavbarItems