import { OrderRepository } from "@/data/OrderRepository";
import { OrderType } from "@/types/OrderType";

async function useOrderCreate (order: OrderType) {
    const orderRepository = new OrderRepository()
    const orderCreated = await orderRepository.create(order)
    return orderCreated
}

export default useOrderCreate