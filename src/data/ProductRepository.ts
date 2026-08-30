import { ProductType } from "@/types/ProductType";
import { ProductApi } from "./ProductApi";
import { getProducts, getProduct, likeProduct } from "./ProductService";

export class ProductRepository implements ProductApi<ProductType> {
    async like(id: string, delta: 1 | -1): Promise<{ id: string; likes: number }> {
        return likeProduct(id, delta)
    }
    async find(id: string): Promise<ProductType> {
        return getProduct(id)
    }
    async all(): Promise<ProductType[]> {
        return getProducts()
    }
}
