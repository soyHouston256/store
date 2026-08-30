export const isDarkHexColor = (color?: string): boolean => {
    const raw = color?.trim().replace(/^#/, "")
    if (!raw) return false

    const hex = raw.length === 3 || raw.length === 4
        ? raw.slice(0, 3).split("").map((char) => char + char).join("")
        : raw.slice(0, 6)

    if (!/^[0-9a-f]{6}$/i.test(hex)) return false

    const r = parseInt(hex.slice(0, 2), 16) / 255
    const g = parseInt(hex.slice(2, 4), 16) / 255
    const b = parseInt(hex.slice(4, 6), 16) / 255
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b

    return luminance < 0.42
}
