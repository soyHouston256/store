import Navbar from '@/components/Navbar'
import SearchBox from '@/components/SearchBox'
import Hero from '@/components/Hero'
import Products from '@/components/Products'
import { Outlet } from "react-router-dom";

function Home(): JSX.Element {
    return (
        <div>
            {/* <Navbar /> */}
            <Hero />
            <SearchBox />
            <Products />
            <Outlet />
        </div>
    )
}

export default Home