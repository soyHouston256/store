import { DevhausLogo } from '@/components/Logo'
import NavbarItems from '@/components/NavbarItems'
import Container from '@/components/layout/Container'
import MobileMenu from '@/components/layout/MobileMenu'
import { NAV_LINKS } from '@/components/layout/navLinks'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useMediaQuery } from 'usehooks-ts'

// Header devhaus (spec R2.2 / design §4). Reemplaza a Navbar.tsx; la columna
// derecha (sonidos, Lottie, dropdown del carrito, ThemeSwitch) sigue viviendo
// en NavbarItems.tsx. En ≤1024 el nav colapsa en MobileMenu y el logo pierde
// el chip.
const HeaderBar = styled.header`
    position: relative;
    height: 84px;
    background: var(--dh-bg);
    border-bottom: 1px solid var(--dh-line);
    z-index: 20;
    @media screen and (max-width: 640px) {
        height: 64px;
    }
`
const HeaderInner = styled(Container)`
    height: 100%;
    display: flex;
    align-items: center;
    gap: 40px;
    .brand {
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        flex-shrink: 0;
    }
    @media screen and (max-width: 1024px) {
        gap: 16px;
        .brand {
            flex-grow: 1;
        }
    }
`
const Nav = styled.nav`
    display: flex;
    align-items: center;
    gap: 28px;
    flex-grow: 1;
    a {
        font-size: 15px;
        font-weight: 500;
        color: var(--dh-ink);
        text-decoration: none;
        white-space: nowrap;
        transition: color 0.15s ease;
        &:hover,
        &:focus-visible {
            color: var(--dh-accent);
        }
        &:focus-visible {
            outline: 2px solid var(--dh-ink);
            outline-offset: 4px;
            border-radius: 4px;
        }
    }
    @media screen and (max-width: 1024px) {
        display: none;
    }
`

function Header(): JSX.Element {
    const isTablet = useMediaQuery('(max-width: 1024px)')
    const isPhone = useMediaQuery('(max-width: 640px)')
    return (
        <HeaderBar>
            <HeaderInner>
                <Link to="/" className="brand" aria-label="Ir al inicio de devhaus.pe">
                    <DevhausLogo markSize={isPhone ? 32 : 40} showChip={!isTablet} />
                </Link>
                <Nav aria-label="Principal">
                    {NAV_LINKS.map((link) => (
                        <Link key={link.label} to={link.to}>{link.label}</Link>
                    ))}
                </Nav>
                <NavbarItems />
                {isTablet && <MobileMenu />}
            </HeaderInner>
        </HeaderBar>
    )
}

export default Header
