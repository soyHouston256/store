import { ProductType } from "@/types/ProductType"
import { Dispatch, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addLike } from "@/store/slices/products/likes";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import LikeButton from "@/components/LikeButton"
import useProductLike from "@/hooks/useProductLike";
import { updateProduct } from "@/store/slices/products";

function LikeProduct({product}: { product: ProductType }): JSX.Element {
    const [like, setLike] = useState(false)
    const dispatch: Dispatch<any> = useDispatch()
    const setProductLiked = useCallback(
        (like: string) => dispatch(addLike({ like })),
        [dispatch]
    )
    const editProduct = useCallback(
        (product: ProductType) => dispatch(updateProduct({ product })),
        [dispatch]
    )
    const { likedList } = useSelector(
        (state: RootState) => state.likes
    )

    useEffect(() => {
        const productLiked = likedList?.find(l => l === product.id)
        setLike(Boolean(productLiked))
    }, [likedList])

    const registerLike = async () => {
        const id = product.id
        if (!id) return
        setProductLiked(id)
        const delta: 1 | -1 = !like ? 1 : -1
        const currentLikes = product.likes ?? 0
        // optimistic local update; the server $inc (floored at 0) is authoritative
        editProduct({ id, likes: Math.max(0, currentLikes + delta) })
        try {
            const { likes } = await useProductLike(id, delta)
            editProduct({ id, likes })
        } catch (err) {
            console.error(err)
            editProduct({ id, likes: currentLikes })
        }
    }
    return (
        <LikeButton liked={registerLike} status={like} />
    )
}

export default LikeProduct