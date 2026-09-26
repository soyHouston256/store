import Container from "@/components/layout/Container";
import { filterProducts } from "@/store/slices/products";
import { Dispatch, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components"

// El botón "Buscar" del header (NavbarItems / MobileMenu) enfoca este input
// (spec R2.2): en la home dispara `SEARCH_FOCUS_EVENT`; desde otra ruta navega
// a `/#buscar` y el input se enfoca al montar con ese hash.
export const SEARCH_FOCUS_EVENT = 'dh:focus-search'
export const SEARCH_ANCHOR = 'buscar'

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
    border-radius: var(--radius-xl);
    background-color: var(--color-neutral);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow);
    margin-top: 40px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    box-sizing: border-box;
    svg {
        margin-right: 10px;
        fill: var(--color-text);
        min-width: 24px;
    }
    input, select {
        border: none;
        background-color: transparent;
        height: 100%;
        color: var(--color-text);
        outline: none;
    }
    select {
        padding-left: 15px;
        min-width: 150px;
    }
    input {
        flex: 1;
        min-width: 0;
    }
    &:focus-within {
        border-color: var(--dh-ink);
    }
    @media screen and (max-width: 1024px){
        margin-top: 25px;
	}
    @media screen and (max-width: 425px){
        margin-top: 20px;
	}
`

function SearchBox(): JSX.Element {
    const [term, setTerm] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const location = useLocation()
    const dispatch: Dispatch<any> = useDispatch()

    const searchProducts = useCallback(
        (term: string) => dispatch(filterProducts({ term })),
        [dispatch]
    )

    useEffect(() => {
        searchProducts(term)
    }, [term])

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
                <svg width="24" height="24" preserveAspectRatio="xMidYMid meet" viewBox="0 0 512 512" aria-hidden="true"><path d="M443.5 420.2L336.7 312.4c20.9-26.2 33.5-59.4 33.5-95.5 0-84.5-68.5-153-153.1-153S64 132.5 64 217s68.5 153 153.1 153c36.6 0 70.1-12.8 96.5-34.2l106.1 107.1c3.2 3.4 7.6 5.1 11.9 5.1 4.1 0 8.2-1.5 11.3-4.5 6.6-6.3 6.8-16.7.6-23.3zm-226.4-83.1c-32.1 0-62.3-12.5-85-35.2-22.7-22.7-35.2-52.9-35.2-84.9 0-32.1 12.5-62.3 35.2-84.9 22.7-22.7 52.9-35.2 85-35.2s62.3 12.5 85 35.2c22.7 22.7 35.2 52.9 35.2 84.9 0 32.1-12.5 62.3-35.2 84.9-22.7 22.7-52.9 35.2-85 35.2z"></path></svg>
                <input
                    ref={inputRef}
                    type="text"
                    aria-label="Buscar producto"
                    placeholder="Busca tu producto..."
                    value={term}
                    onChange={(event) => {
                        setTerm(event.target.value);
                    }}
                />
            </SearchBoxWrapper>
        </Container>
    )
}

export default SearchBox
