import { ProductCartAction, ProductsCartState } from '@/type';
import { ProductCartActionType, ProductCartType } from '@/types/ProductType';
import { normalizeLogoPosition } from '@/data/logoPositions';
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Carrito (spec R4.6 / design §7.4): una línea por combinación
// `id + cut + color + size + logoPosition` (reemplaza el `_id` aleatorio de
// antes). Cantidad máxima por línea: 10.
export const MAX_CART_QUANTITY = 10

/** Clave estable de la línea del carrito; también sirve como `key` de React. */
export const cartItemKey = (item: ProductCartType): string =>
    [
        item.id ?? item._id ?? '',
        item.cut ?? '',
        item.color ?? '',
        item.size ?? '',
        normalizeLogoPosition(item.logoPosition) ?? ''
    ].join('|')

const sameLine = (a: ProductCartType, b: ProductCartType): boolean => cartItemKey(a) === cartItemKey(b)

const clampQuantity = (quantity: number): number => Math.min(MAX_CART_QUANTITY, Math.max(1, quantity))

export const cartSlice = createSlice({
    name: "cart",
    initialState: {
        productsCart: [],
    } as ProductsCartState,
    reducers: {
        addToCart(state, action: PayloadAction<ProductCartAction>) {
            const { product, type } = action.payload
            const itemInCart = state.productsCart.find((item) => sameLine(item, product));
            if (itemInCart) {
                const current = itemInCart.quantity ?? 1
                if (type === ProductCartActionType.SUM) itemInCart.quantity = clampQuantity(current + (product.quantity ?? 1))
                if (type === ProductCartActionType.ADD) itemInCart.quantity = clampQuantity(current + 1)
            } else {
                const { sizes, colors, ...line } = product
                state.productsCart.push({ ...line, quantity: clampQuantity(product.quantity || 1) });
            }
        },
        removeFromCart(state, action: PayloadAction<ProductCartAction>) {
            const newProduct: ProductCartType = action.payload.product
            const itemInCart = state.productsCart.find((item) => sameLine(item, newProduct));
            if (itemInCart) {
                if ((itemInCart.quantity ?? 1) > 1) itemInCart.quantity = (itemInCart.quantity ?? 1) - 1;
                else state.productsCart = state.productsCart.filter((item) => !sameLine(item, newProduct));
            }
        },
        removeAllProducts(state) {
            state.productsCart = []
        },
    }
})

export const { addToCart, removeFromCart, removeAllProducts } = cartSlice.actions

export default cartSlice.reducer
