import Logo from '@/components/Logo'
import NavbarItems from '@/components/NavbarItems'
import { Link } from 'react-router-dom';
import styled from 'styled-components'

const NavbarWrapper = styled.nav`
	display: flex;
	align-items: center;
	width: var(--screen-desktop);
	margin: 0 auto;
	justify-content: space-between;
	height: 100px;
	@media screen and (max-width: 1024px){
		width: var(--screen-tablet);
	}
	@media screen and (max-width: 768px){
		width: var(--screen-phone);
		height: 80px;
	}
	@media screen and (max-width: 425px){
		width: 100%;
		padding: 0 20px;
		box-sizing: border-box;
	}
`

function Navbar(): JSX.Element {
	return (
		<NavbarWrapper>
			<Link to='/'>
				<Logo />
			</Link>
			<NavbarItems />
		</NavbarWrapper>
	)
}
export default Navbar