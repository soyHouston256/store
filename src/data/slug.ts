// Slug de producto (spec R4.1 / design C8), mismo algoritmo que api/src/models/slug.ts
// y backoffice/src/api/slug.ts: NFD → sin diacríticos → minúsculas →
// `[^a-z0-9]+` → `-` → sin guiones en los extremos → máximo 80 caracteres.

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const SLUG_MAX_LENGTH = 80

export const slugify = (value: string): string => {
    const base = value
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    return base.slice(0, SLUG_MAX_LENGTH).replace(/-+$/g, '')
}

export const isValidSlug = (value: string): boolean =>
    value.length > 0 && value.length <= SLUG_MAX_LENGTH && SLUG_PATTERN.test(value)
