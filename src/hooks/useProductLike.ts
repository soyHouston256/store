import { ProductRepository } from "@/data/ProductRepository";

async function useProductLike(id: string, delta: 1 | -1) {
    const productRepository = new ProductRepository()
    return productRepository.like(id, delta)
}

export default useProductLike
