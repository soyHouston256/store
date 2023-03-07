export interface ProductApi<T> {
    all(): Promise<T[]>;
    find(id: string): Promise<T>;
    update(id: string, { likes }: { likes: number }): Promise<T>;
}