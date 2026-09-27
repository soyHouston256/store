export interface ProductApi<T> {
    all(): Promise<T[]>;
    /** Por id o slug (spec R4.2). */
    find(idOrSlug: string): Promise<T>;
    like(id: string, delta: 1 | -1): Promise<{ id: string; likes: number }>;
}
