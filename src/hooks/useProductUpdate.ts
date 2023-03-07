import { ProductRepository } from "@/data/ProductRepository";

async function useProductUpdate(id: string, { likes }: { likes: number }) {
    const productRepository = new ProductRepository()
    const productUpdated = await productRepository.update(id, { likes })
    return productUpdated
}

export default useProductUpdate