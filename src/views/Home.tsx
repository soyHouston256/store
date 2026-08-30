import SearchBox from '@/components/SearchBox'
import Hero from '@/components/Hero'
import Benefits from '@/components/Benefits'
import Products from '@/components/Products'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'
import { Outlet } from "react-router-dom";

function Home(): JSX.Element {
    return (
        <div>
            <Hero />
            <Benefits />
            <SearchBox />
            <Products />
            <Testimonials />
            <Footer />
            <Outlet />
        </div>
    )
}

export default Home
