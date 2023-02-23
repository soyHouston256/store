import { ProductType } from "@/types/ProductType";
import { ProductApi } from "./ProductApi";
import { getProducts, getProduct } from "./ProductService";

export class ProductRepository implements ProductApi<ProductType> {
    async find(id: string): Promise<ProductType> {
        const product = await getProduct(id)
        return product!
    }
    async all(): Promise<ProductType[]> {
        const products = await getProducts()
        return products
    }
}