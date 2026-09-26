import SearchBox from '@/components/SearchBox'
import Hero from '@/components/Hero'
import Benefits from '@/components/Benefits'
import Products from '@/components/Products'
import { Outlet } from "react-router-dom";

function Home(): JSX.Element {
    return (
        <div>
            <Hero />
            <Benefits />
            <SearchBox />
            <Products />
            <Outlet />
        </div>
    )
}

export default Home
