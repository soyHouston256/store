import { OrderType } from "@/types/OrderType"
import { OrderApi } from "./OrderApi"
import { createOrder } from "./OrderService"

export class OrderRepository implements OrderApi<OrderType> {
    async create(order: OrderType): Promise<OrderType> {
        const orderCreated = await createOrder(order)
        return orderCreated
    }
}