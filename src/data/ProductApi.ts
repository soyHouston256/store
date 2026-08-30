export interface ProductApi<T> {
    all(): Promise<T[]>;
    find(id: string): Promise<T>;
    like(id: string, delta: 1 | -1): Promise<{ id: string; likes: number }>;
}
