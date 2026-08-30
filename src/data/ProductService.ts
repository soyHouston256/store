import type { LogoPosition, ProductKind, ProductType } from "@/types/ProductType";
import { assetUrl, request } from "./http";

interface ProductDTO {
    id?: string;
    _id?: string;
    name?: string;
    price?: number;
    type?: ProductKind;
    colors?: string[];
    sizes?: string[];
    logoPositions?: LogoPosition[];
    likes?: number;
    published?: boolean;
    image?: string;
    logo?: string;
}

/** Read-time tolerance mapping: legacy/partial docs never reach components raw. */
const toProduct = (dto: ProductDTO): ProductType => ({
    ...dto,
    id: dto.id ?? dto._id,
    likes: dto.likes ?? 0,
    colors: dto.colors ?? [],
    sizes: dto.sizes ?? [],
    logoPositions: dto.logoPositions ?? [],
    type: dto.type ?? 'polo',
    logo: assetUrl(dto.logo),
})

export const getProducts = async (): Promise<ProductType[]> => {
    const products = await request<ProductDTO[]>('/api/products')
    return products.map(toProduct)
}

export const getProduct = async (id: string): Promise<ProductType> => {
    const product = await request<ProductDTO>(`/api/products/${encodeURIComponent(id)}`)
    return toProduct(product)
}

export const likeProduct = async (id: string, delta: 1 | -1): Promise<{ id: string; likes: number }> => {
    return request<{ id: string; likes: number }>(`/api/products/${encodeURIComponent(id)}/like`, {
        method: 'POST',
        body: JSON.stringify({ delta }),
    })
}
