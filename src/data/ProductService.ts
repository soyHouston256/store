import type { Cut, LogoPosition, ProductImage, ProductKind, ProductType } from "@/types/ProductType";
import { isCut } from "@/data/cuts";
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
    createdAt?: string;
    slug?: string;
    cuts?: Cut[];
    soldOut?: boolean;
    images?: ProductImage[];
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
    // Fase 4 (spec R4.1): el DTO siempre trae `slug`, `cuts` y `soldOut`; se
    // tolera su ausencia (docs pre-migración) con defaults seguros.
    slug: dto.slug ?? dto.id ?? dto._id,
    cuts: (dto.cuts ?? []).filter(isCut),
    soldOut: dto.soldOut ?? false,
})

export const getProducts = async (): Promise<ProductType[]> => {
    const products = await request<ProductDTO[]>('/api/products')
    return products.map(toProduct)
}

/** `GET /api/products/:idOrSlug` (spec R4.2): acepta id o slug. */
export const getProduct = async (idOrSlug: string): Promise<ProductType> => {
    const product = await request<ProductDTO>(`/api/products/${encodeURIComponent(idOrSlug)}`)
    return toProduct(product)
}

export const likeProduct = async (id: string, delta: 1 | -1): Promise<{ id: string; likes: number }> => {
    return request<{ id: string; likes: number }>(`/api/products/${encodeURIComponent(id)}/like`, {
        method: 'POST',
        body: JSON.stringify({ delta }),
    })
}
