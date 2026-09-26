import { NAV_LINKS } from '@/components/layout/navLinks'
import { useRequestSearchFocus } from '@/components/SearchBox'
import useOnClickOutside from '@/hooks/useOnClickOutside'
import { RootState } from '@/store'
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'

// Menú hamburguesa ≤1024 (spec R2.2, escenario "Menú móvil"): 5 enlaces del nav
// + "Sigue tu pedido" (+ Buscar y Favoritos, que en ≤640 salen del header).
// Cierra con Escape, click fuera o al navegar.
const MenuRoot = styled.div`
    display: flex;
    align-items: center;
`
const Burger = styled.button`
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
    svg {
        width: 20px;
        height: 20px;
    }
    &:focus-visible {
        outline: 2px solid var(--dh-ink);
        outline-offset: 2px;
    }
`
const Panel = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--dh-bg);
    border-bottom: 1px solid var(--dh-line);
    box-shadow: var(--shadow-dark);
    padding: 8px var(--dh-page-x) 16px;
    ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
    }
    li + li {
        border-top: 1px solid var(--dh-line);
    }
    a,
    button.row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        min-height: 52px;
        padding: 0;
        font-family: inherit;
        font-size: 17px;
        font-weight: 600;
        color: var(--dh-ink);
        background: transparent;
        border: none;
        text-decoration: none;
        text-align: left;
        cursor: pointer;
        &:hover,
        &:focus-visible {
            color: var(--dh-accent);
        }
    }
    li.secondary a,
    li.secondary button.row {
        font-size: 15px;
        font-weight: 500;
        color: var(--dh-muted);
    }
    .count {
        font-size: 13px;
        font-weight: 700;
        min-width: 22px;
        height: 22px;
        padding: 0 7px;
        border-radius: 11px;
        background: var(--dh-ink);
        color: var(--color-text-invert);
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    .only-phone {
        display: none;
    }
    @media screen and (max-width: 640px) {
        .only-phone {
            display: block;
        }
    }
`

function MobileMenu(): JSX.Element {
    const [open, setOpen] = useState(false)
    const rootRef = useRef<HTMLDivElement>(null)
    const location = useLocation()
    const { likedList } = useSelector((state: RootState) => state.likes)
    const requestSearchFocus = useRequestSearchFocus()

    useOnClickOutside(rootRef, () => setOpen(false))

    useEffect(() => {
        setOpen(false)
    }, [location.key])

    useEffect(() => {
        if (!open) return
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false)
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [open])

    const onSearch = () => {
        setOpen(false)
        requestSearchFocus()
    }

    return (
        <MenuRoot ref={rootRef}>
            <Burger
                type="button"
                aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={open}
                aria-controls="mobile-menu"
                onClick={() => setOpen((value) => !value)}
            >
                {open ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
                )}
            </Burger>
            {open && (
                <Panel id="mobile-menu">
                    <nav aria-label="Principal (móvil)">
                        <ul>
                            {NAV_LINKS.map((link) => (
                                <li key={link.label}><Link to={link.to}>{link.label}</Link></li>
                            ))}
                            <li className="secondary"><Link to="/pedido">Sigue tu pedido</Link></li>
                            <li className="secondary only-phone">
                                <button type="button" className="row" onClick={onSearch}>Buscar</button>
                            </li>
                            <li className="secondary only-phone">
                                <Link to="/favoritos">
                                    Favoritos
                                    {likedList.length > 0 && <span className="count">{likedList.length}</span>}
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </Panel>
            )}
        </MenuRoot>
    )
}

export default MobileMenu
