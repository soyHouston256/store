import { configureStore } from '@reduxjs/toolkit'
import products from './slices/products'
import orders from './slices/orders'

const store = configureStore({
    reducer: {
        products,
        orders
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store