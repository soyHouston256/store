import Container from "@/components/layout/Container";
import { useCatalogParams } from "@/hooks/useCatalogUrlSync";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components"

// El botón "Buscar" del header (NavbarItems / MobileMenu) enfoca este input
// (spec R2.2): en la home dispara `SEARCH_FOCUS_EVENT`; desde otra ruta navega
// a `/#buscar` y el input se enfoca al montar con ese hash.
export const SEARCH_FOCUS_EVENT = 'dh:focus-search'
export const SEARCH_ANCHOR = 'buscar'
const SEARCH_DEBOUNCE_MS = 250

export function useRequestSearchFocus(): () => void {
    const navigate = useNavigate()
    const location = useLocation()
    return useCallback(() => {
        if (location.pathname === '/') {
            window.dispatchEvent(new CustomEvent(SEARCH_FOCUS_EVENT))
        } else {
            navigate(`/#${SEARCH_ANCHOR}`)
        }
    }, [location.pathname, navigate])
}

const SearchBoxWrapper = styled.div`
    height: 48px;
    border-radius: var(--dh-radius-pill);
    background-color: var(--dh-surface);
    border: 1px solid var(--dh-line-2);
    display: flex;
    align-items: center;
    padding: 0 20px;
    box-sizing: border-box;
    svg {
        margin-right: 10px;
        stroke: var(--dh-muted);
        min-width: 20px;
    }
    input {
        border: none;
        background-color: transparent;
        height: 100%;
        color: var(--dh-ink);
        outline: none;
        flex: 1;
        min-width: 0;
        font-size: 15px;
        font-family: inherit;
        &::placeholder {
            color: var(--dh-muted);
        }
    }
    .clear {
        border: none;
        background: transparent;
        color: var(--dh-muted);
        font-size: 13px;
        cursor: pointer;
        padding: 0 4px;
        font-family: inherit;
        &:hover {
            color: var(--dh-ink);
        }
    }
    &:focus-within {
        border-color: var(--dh-ink);
    }
`

// Búsqueda por texto (spec R0.2 / R3.5): escribe `?q=` con debounce 250 ms vía
// `setParam` (`replace:false`); nunca despacha a Redux directamente. Si la URL
// cambia desde fuera (Atrás, deep link) el input se actualiza.
function SearchBox(): JSX.Element {
    const { filters, setParam } = useCatalogParams()
    const [term, setTerm] = useState(filters.term)
    const lastPushed = useRef(filters.term)
    const inputRef = useRef<HTMLInputElement>(null)
    const location = useLocation()

    useEffect(() => {
        if (filters.term !== lastPushed.current) {
            lastPushed.current = filters.term
            setTerm(filters.term)
        }
    }, [filters.term])

    useEffect(() => {
        if (term === lastPushed.current) return
        const timer = window.setTimeout(() => {
            lastPushed.current = term
            setParam('q', term.trim() ? term : null)
        }, SEARCH_DEBOUNCE_MS)
        return () => window.clearTimeout(timer)
    }, [term, setParam])

    const focusInput = useCallback(() => {
        const input = inputRef.current
        if (!input) return
        input.scrollIntoView({ behavior: 'smooth', block: 'center' })
        input.focus({ preventScroll: true })
    }, [])

    useEffect(() => {
        window.addEventListener(SEARCH_FOCUS_EVENT, focusInput)
        return () => window.removeEventListener(SEARCH_FOCUS_EVENT, focusInput)
    }, [focusInput])

    useEffect(() => {
        if (location.hash === `#${SEARCH_ANCHOR}`) focusInput()
    }, [location.key, focusInput])

    return (
        <Container id={SEARCH_ANCHOR}>
            <SearchBoxWrapper>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
                <input
                    ref={inputRef}
                    type="search"
                    aria-label="Buscar producto"
                    placeholder="Busca tu producto..."
                    value={term}
                    onChange={(event) => setTerm(event.target.value)}
                />
                {term && (
                    <button type="button" className="clear" onClick={() => setTerm('')} aria-label="Limpiar búsqueda">
                        Limpiar
                    </button>
                )}
            </SearchBoxWrapper>
        </Container>
    )
}

export default SearchBox
