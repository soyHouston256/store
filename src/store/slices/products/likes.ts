import { LikesAction, LikesState } from '@/type';
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const likesSlice = createSlice({
    name: "likes",
    initialState: {
        likedList: [],
    } as LikesState,
    reducers: {
        addLike(state, action: PayloadAction<LikesAction>) {
            const { like } = action.payload
            const item = state.likedList.findIndex((item) => item === like);
            if (item !== -1) {
                state.likedList.splice(item, 1)
            }
            if (item === -1) {
                state.likedList.push(like!)
            }
        }
    }
})

export const { addLike } = likesSlice.actions

export default likesSlice.reducer