import { ProductType } from "@/types/ProductType"
import { Dispatch, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addLike } from "@/store/slices/products/likes";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import LikeButton from "@/components/LikeButton"
import useProductUpdate from "@/hooks/useProductUpdate";
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

    const registerLike = () => {
        setProductLiked(product.id!)
        const likes = !like ? product.likes! + 1 : product.likes! - (product.likes! > 0 ? 1 : 0)
        editProduct({ id: product.id!, likes })
        useProductUpdate(product.id!, { likes })
    }
    return (
        <LikeButton liked={registerLike} status={like} />
    )
}

export default LikeProduct