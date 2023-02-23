import { ProductRepository } from "@/data/ProductRepository";
import { ProductType } from "@/types/ProductType";
import { useEffect, useState } from "react";

function useProductsById(id: string) {
    const [product, setProduct] = useState<ProductType>()

    useEffect(() => {
        (async () => {
            const productRepository = new ProductRepository()
            const productData = await productRepository.find(id)
            setProduct(productData)
        })();
    }, [])
    return { product }
}

export default useProductsById