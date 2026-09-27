import '@/assets/reset.css'
import '@/App.css'
import { GlobalStyles } from '@/Theme'
import Home from '@/views/Home'
import ProductPage from '@/views/ProductPage'
import LegacyProductRedirect from '@/views/LegacyProductRedirect'
import { Navigate, Route, Routes } from 'react-router-dom'
import Cart from '@/views/Cart'
import useProductsList from './hooks/useProductsList'
import { RootState } from './store'
import { useSelector } from 'react-redux'
import Done from './views/Done'
import Tracking from './views/Tracking'
import { useReadLocalStorage } from 'usehooks-ts'
import Layout from './components/layout/Layout'
import Favorites from './views/Favorites'
import StaticPage from './views/static/StaticPage'
import { STATIC_PAGES } from './content/pages'


function App() {
    const orderId = useReadLocalStorage<string>('order')

    // Carga el catálogo una vez y publica loading/error/data en el slice `products` (spec R3.1).
    useProductsList()

    const { productsCart } = useSelector(
        (state: RootState) => state.cart
    )

    return (
        <div className="App">
        <GlobalStyles />
        <Layout>
        <Routes>
            <Route path="/" element={<Home />} />
            {/* Ficha de producto (fase 5, spec R5.1): página completa por slug; la ruta
                legada del modal redirige con replace a /producto/:slug. */}
            <Route path="/producto/:slug" element={<ProductPage />} />
            <Route path="/product/:id" element={<LegacyProductRedirect />} />
            <Route path="/cart" element={productsCart.length ? <Cart /> : <Navigate to='/' />}>
            </Route>
            <Route path="/done" element={orderId ? <Done /> : <Navigate to='/' />} >
            </Route>
            <Route path="/pedido" element={<Tracking />}>
            </Route>
            <Route path="/pedido/:id" element={<Tracking />}>
            </Route>
            <Route path="/favoritos" element={<Favorites />} />
            {Object.entries(STATIC_PAGES).map(([path, page]) => (
                <Route key={path} path={`/${path}`} element={<StaticPage {...page} />} />
            ))}
        </Routes>
        </Layout>
    </div>
    )
}

export default App
