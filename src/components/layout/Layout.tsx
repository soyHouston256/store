import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/Footer'
import { ReactNode, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'

// Shell global (design §4): AnnouncementBar + Header + <main> + Footer en todas
// las rutas (spec R2.3). `min-height` empuja el footer al fondo en páginas cortas.
const Shell = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    main {
        flex: 1 0 auto;
    }
`

// Con el footer global las rutas cambian sin recargar: al cambiar de pathname se
// vuelve al tope (la ficha `/producto/:slug` es una página completa desde la
// fase 5; sus cambios de query con `replace` no mueven el scroll) y los enlaces
// con `#hash` (/#catalogo, /#personaliza, /#buscar) desplazan hasta el ancla.
function ScrollManager(): null {
    const location = useLocation()
    const previous = useRef(location.pathname)
    useEffect(() => {
        const { pathname, hash } = location
        if (hash) {
            const target = document.getElementById(hash.slice(1))
            if (target) {
                window.requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }))
            }
        } else if (pathname !== previous.current) {
            window.scrollTo({ top: 0 })
        }
        previous.current = pathname
    }, [location.key])
    return null
}

function Layout({ children }: { children: ReactNode }): JSX.Element {
    return (
        <Shell>
            <ScrollManager />
            <AnnouncementBar />
            <Header />
            <main>{children}</main>
            <Footer />
        </Shell>
    )
}

export default Layout
