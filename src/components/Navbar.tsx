import Logo from '@/components/Logo'
import NavbarItems from '@/components/NavbarItems'
import styled from 'styled-components'

const NavbarWrapper = styled.nav`
	display: flex;
	align-items: center;
	width: var(--screen-desktop);
	margin: 0 auto;
	justify-content: space-between;
	height: 100px;
`

function Navbar(): JSX.Element {
	
	return (
		<NavbarWrapper>
			<Logo />
			<NavbarItems />
		</NavbarWrapper>
	)
}
export default Navbar