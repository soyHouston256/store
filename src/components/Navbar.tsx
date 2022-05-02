import Logo from '@/components/Logo'
import NavbarItems from '@/components/NavbarItems'
import '@/components/Navbar.scss'

function Navbar() {
    return (
        <nav className="Navbar">
            <Logo />
            <NavbarItems />
        </nav>
    )
}
export default Navbar