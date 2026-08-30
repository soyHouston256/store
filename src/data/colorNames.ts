// Small Spanish color-name table: tracking shows a friendly name next to the
// swatch instead of a raw hex. Nearest match by squared RGB distance; non-hex
// values (e.g. css keywords) simply get no name — the swatch alone suffices.
const NAMED_COLORS: Array<[string, number, number, number]> = [
    ['Blanco', 255, 255, 255],
    ['Negro', 20, 20, 20],
    ['Gris', 128, 128, 128],
    ['Rojo', 210, 45, 45],
    ['Azul', 40, 70, 200],
    ['Celeste', 130, 200, 235],
    ['Verde', 55, 140, 70],
    ['Amarillo', 240, 220, 60],
    ['Naranja', 240, 150, 50],
    ['Rosado', 240, 140, 180],
    ['Morado', 130, 60, 180],
    ['Marrón', 120, 75, 40],
    ['Beige', 235, 220, 190]
]

const parseHex = (color: string): [number, number, number] | undefined => {
    const hex = color.trim().replace(/^#/, '')
    if (!/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) return undefined
    const full = hex.length === 3
        ? hex.split('').map((char) => char + char).join('')
        : hex
    return [
        parseInt(full.slice(0, 2), 16),
        parseInt(full.slice(2, 4), 16),
        parseInt(full.slice(4, 6), 16)
    ]
}

export const nearestColorName = (color?: string): string | undefined => {
    if (!color) return undefined
    const rgb = parseHex(color)
    if (!rgb) return undefined
    let best: string | undefined
    let bestDistance = Infinity
    for (const [name, r, g, b] of NAMED_COLORS) {
        const dr = r - rgb[0]
        const dg = g - rgb[1]
        const db = b - rgb[2]
        const distance = dr * dr + dg * dg + db * db
        if (distance < bestDistance) {
            bestDistance = distance
            best = name
        }
    }
    return best
}
