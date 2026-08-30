import { OrderType } from "@/types/OrderType";
import { ProductCartType } from "@/types/ProductType";
import { request } from "./http";

interface OrderItemDTO {
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
    logoPosition?: string;
}

interface OrderDTO {
    id: string;
    total: number;
}

export interface TrackingItemDTO {
    name: string;
    type: string;
    quantity: number;
    size?: string;
    color?: string;
    logoPosition?: string;
    /** Product's current public artwork ("/uploads/..." or legacy absolute URL). */
    logo?: string;
}

export interface OrderTrackingDTO {
    id: string;
    status: string;
    createdAt: string;
    /** Absent when status is 'finalizado' — the server sends a minimal payload. */
    items?: TrackingItemDTO[];
    /** Absent when status is 'finalizado' — the server sends a minimal payload. */
    total?: number;
}

const toOrderItem = (item: ProductCartType): OrderItemDTO => {
    const dto: OrderItemDTO = {
        productId: item.id ?? '',
        quantity: item.quantity ?? 1,
    }
    if (item.size) dto.size = item.size
    if (item.color) dto.color = item.color
    if (item.logoPosition) dto.logoPosition = item.logoPosition
    return dto
}

/**
 * POST /api/orders — the server snapshots product data, recomputes the total
 * and generates the order id. The returned order carries both.
 */
export const createOrder = async (order: OrderType): Promise<OrderType> => {
    const created = await request<OrderDTO>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
            user: order.user,
            items: (order.products ?? []).map(toOrderItem),
        }),
    })
    return { ...order, id: created.id, total: created.total }
}

/**
 * GET /api/orders/:id/tracking — public tracking info (no customer data).
 * The server resolves the id case-insensitively; 404 → ApiError NOT_FOUND.
 */
export const getOrderTracking = async (id: string): Promise<OrderTrackingDTO> => {
    return request<OrderTrackingDTO>(`/api/orders/${encodeURIComponent(id)}/tracking`)
}
