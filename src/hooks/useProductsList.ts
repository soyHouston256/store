import { ProductRepository } from "@/data/ProductRepository"
import { ProductType } from "@/types/ProductType";
import { useEffect, useState } from "react"

function useProductsList() {
    const [products, setProducts] = useState<ProductType[]>([])
    
    useEffect(() => {
        (async () => {
            const productRepository = new ProductRepository()
            const productsData = await productRepository.all()
            setProducts(productsData)
        })();
    }, [])
    return { products }
}

export default useProductsList