export interface ProductApi<T> {
    all(): Promise<T[]>;
    find(id: string): Promise<T>;
}