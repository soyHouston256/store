import Hero from '@/components/Hero'
import CategoryTiles from '@/components/CategoryTiles'
import Products from '@/components/Products'
import Customize from '@/components/Customize'
import TrustBar from '@/components/TrustBar'
import Faq from '@/components/Faq'
import { Outlet } from "react-router-dom";
import styled from 'styled-components'

// Home (spec 02): Hero → Tiles → Catálogo (buscador + filtros dentro) →
// Personalización → Barra de confianza → FAQ. Las reseñas (spec 02 §6) no se
// renderizan: solo con reseñas reales (`reviews.source`), hoy TODO.
const Page = styled.div`
    padding-bottom: var(--dh-section-y);
    @media screen and (max-width: 640px){
        padding-bottom: 48px;
    }
`

function Home(): JSX.Element {
    return (
        <Page>
            <Hero />
            <CategoryTiles />
            <Products />
            <Customize />
            <TrustBar />
            <Faq />
            <Outlet />
        </Page>
    )
}

export default Home
