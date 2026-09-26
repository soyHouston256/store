import { DevhausLogo } from '@/components/Logo'
import NavbarItems from '@/components/NavbarItems'
import { Link } from 'react-router-dom';
import styled from 'styled-components'
import { useMediaQuery } from 'usehooks-ts'

const NavbarWrapper = styled.nav`
    display: flex;
    align-items: center;
    width: var(--screen-desktop);
    margin: 0 auto;
    justify-content: space-between;
    height: 100px;
    > a {
        display: inline-flex;
        text-decoration: none;
    }
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
    const isMobile = useMediaQuery('(max-width: 768px)')
    return (
        <NavbarWrapper>
            <Link to='/' aria-label="Ir al inicio de devhaus.pe">
                <DevhausLogo markSize={isMobile ? 32 : 40} showChip={!isMobile} />
            </Link>
            <NavbarItems />
        </NavbarWrapper>
    )
}
export default Navbar
