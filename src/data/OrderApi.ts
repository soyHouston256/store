export interface OrderApi<T> {
    create(order: T): Promise<T>;
}