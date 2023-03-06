import { OrderAction, OrdersState } from "@/type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

 
export const ordersSlice = createSlice({
    name: "orders",
    initialState: {
        user: {
            dni: '',
            name: '',
            phone: ''
        },
        total: 0
    } as OrdersState,
    reducers: {
        updateUser(state, action: PayloadAction<OrderAction>) {
            const { user } = action.payload
            state.user = {...state.user, ...user}
        },
        updateTotal(state, action: PayloadAction<OrderAction>) {
            const { total } = action.payload
            state.total = total!
        },
        removeUser(state) {
            state.user = {
                dni: '',
                name: '',
                phone: ''
            }
        }
    }
})

export const { updateUser, updateTotal, removeUser } = ordersSlice.actions
export default ordersSlice.reducer