import { configureStore, combineReducers } from '@reduxjs/toolkit'
import products from './slices/products'
import cart from './slices/products/cart'
import likes from './slices/products/likes'
import orders from './slices/orders'
import {
    persistReducer,
    createMigrate,
    MigrationManifest,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

// v2 (API cutover): purge carts persisted before the Firestore -> API switch —
// their items lack `type` and carry stale Firestore-era snapshots.
const migrations: MigrationManifest = {
    2: (state: any) => ({
        ...state,
        cart: { productsCart: [] },
    }),
}

const persistConfig = {
    key: 'root',
    version: 2,
    migrate: createMigrate(migrations),
    blacklist: ['orders', 'products'],
    storage,
}
const reducers = combineReducers({cart, likes, products, orders})
const persistedReducer = persistReducer(persistConfig, reducers)

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store