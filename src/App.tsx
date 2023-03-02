import { Dispatch, useCallback, useEffect, useState } from 'react'

import '@/assets/reset.css'
import '@/App.css'
import { ThemeContext, Theme } from '@/components/context/ThemeContext'
import { GlobalStyles } from '@/Theme'
import Home from '@/views/Home'
import Product from '@/components/Product'
import { Route, Routes, useLocation } from 'react-router-dom'
import Cart from '@/views/Cart'
import { useDispatch } from 'react-redux'
import { addAllProducts } from './store/slices/products'
import useProductsList from './hooks/useProductsList'
import { ProductType } from './types/ProductType'

function App() {
  const [theme, setTheme] = useState(Theme.Light);
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

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <GlobalStyles />
      <div className="App">
        <Routes location={background || location}>
          <Route path="/" element={<Home />}>
            <Route path="/product/:id" element={<Product />} />
          </Route>
          <Route path="/cart" element={<Cart />}>
          </Route>
        </Routes>
        {background && (
          <Routes>
            <Route path="modal" element={<Product />} />
          </Routes>
        )}
      </div>
    </ThemeContext.Provider>
  )
}

export default App
