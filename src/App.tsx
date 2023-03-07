import { Dispatch, useCallback, useEffect, useState } from 'react'

import '@/assets/reset.css'
import '@/App.css'
import { GlobalStyles } from '@/Theme'
import Home from '@/views/Home'
import Product from '@/views/Product'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Cart from '@/views/Cart'
import { useDispatch } from 'react-redux'
import { addAllProducts } from './store/slices/products'
import useProductsList from './hooks/useProductsList'
import { ProductType } from './types/ProductType'
import { RootState } from './store'
import { useSelector } from 'react-redux'
import Done from './views/Done'
import { useReadLocalStorage } from 'usehooks-ts'
import Navbar from './components/Navbar'


function App() {
    const orderId = useReadLocalStorage<string>('order')
    const location = useLocation();
    const background = location.state && location.state.background;
    const dispatch: Dispatch<any> = useDispatch()
    const setProducts = useCallback(
        (products: ProductType[]) => dispatch(addAllProducts({ products })),
        [dispatch]
    )

    const { products } = useProductsList()
    useEffect(() => {
        setProducts(products)
    }, [products])

    const { productsCart } = useSelector(
        (state: RootState) => state.cart
    )

    return (
        <div className="App">
        <Navbar />
        <GlobalStyles />
        <Routes location={background || location}>
            <Route path="/" element={<Home />}>
                <Route path="/product/:id" element={<Product />} />
            </Route>
            <Route path="/cart" element={productsCart.length ? <Cart /> : <Navigate to='/' />}>
            </Route>
            <Route path="/done" element={orderId ? <Done /> : <Navigate to='/' />} >
            </Route>
        </Routes>
        {background && (
            <Routes>
                <Route path="/product/:id" element={<Product />} />
            </Routes>
        )}
    </div>
    )
}

export default App
