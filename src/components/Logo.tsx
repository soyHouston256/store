// devhaus.pe — Logo como componente React (SVG inline, sin dependencias).
// Adaptado de docs/devhaus-handoff/brand/components/Logo.tsx (spec R1.4).
// La casa es un git graph: cada esquina es un commit, el techo amarillo es HEAD
// y la curva en color acento es una rama que se fusiona en main.
//
// `variant`: 'light' (marca sobre fondo claro), 'dark' (sobre fondo oscuro) o
// 'auto' (default) que sigue `body.dark-theme`, la fuente de verdad del tema
// (ThemeSwitch.tsx).

import { useEffect, useState } from 'react'

type Detail = 'full' | 'medium' | 'small' | 'tiny'
export type LogoVariant = 'light' | 'dark' | 'auto'

const INK = '#1B1A17'
const CREAM = '#FAF6F1'
const DARK_CLASS = 'dark-theme'

const readBodyDark = (): boolean =>
    typeof document !== 'undefined' && document.body.classList.contains(DARK_CLASS)

/** true mientras `body` tenga la clase `dark-theme`; observa cambios de clase. */
export function useBodyDarkTheme(): boolean {
    const [isDark, setIsDark] = useState<boolean>(readBodyDark)
    useEffect(() => {
        if (typeof document === 'undefined') return
        setIsDark(readBodyDark())
        const observer = new MutationObserver(() => setIsDark(readBodyDark()))
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
        return () => observer.disconnect()
    }, [])
    return isDark
}

const resolveOnDark = (variant: LogoVariant, bodyDark: boolean): boolean =>
    variant === 'dark' || (variant === 'auto' && bodyDark)

type MarkProps = {
    size?: number
    /** full ≥ 96px · medium 40–95px · small 24–39px · tiny < 24px */
    detail?: Detail
    /** true = casa oscura sobre cuadro crema (para fondos oscuros). Ignorado si se pasa `variant`. */
    inverse?: boolean
    variant?: LogoVariant
    className?: string
    title?: string
}

export function DevhausMark({ size = 40, detail, inverse, variant, className, title }: MarkProps) {
    const bodyDark = useBodyDarkTheme()
    const isInverse = variant ? resolveOnDark(variant, bodyDark) : Boolean(inverse)
    const d: Detail = detail ?? (size >= 96 ? 'full' : size >= 40 ? 'medium' : size >= 24 ? 'small' : 'tiny')
    const bg = isInverse ? CREAM : INK
    const fg = isInverse ? INK : CREAM
    const head = isInverse ? 'var(--dh-yellow-dark, #D9A62E)' : 'var(--dh-yellow, #E9B949)'
    const merge = 'var(--dh-accent, #D2432F)'
    const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true as const }

    return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={className} {...a11y}>
            <rect width="48" height="48" rx={d === 'tiny' ? 10 : 12} fill={bg} />
            {d === 'full' && (
                <>
                    <path d="M12 36 V22 L24 11 L36 22 V36" stroke={fg} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M12 29 Q24 29 24 36" stroke={merge} strokeWidth="2.6" strokeLinecap="round" fill="none" />
                    <circle cx="24" cy="11" r="3.4" fill={head} />
                    {[[12, 22], [36, 22], [12, 36], [36, 36]].map(([cx, cy]) => (
                        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.4" fill={fg} />
                    ))}
                    <circle cx="24" cy="36" r="3.4" fill={merge} />
                </>
            )}
            {d === 'medium' && (
                <>
                    <path d="M12 36 V22 L24 11 L36 22 V36" stroke={fg} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M12 29 Q24 29 24 36" stroke={merge} strokeWidth="3.2" strokeLinecap="round" fill="none" />
                    <circle cx="24" cy="11" r="4" fill={head} />
                    <circle cx="12" cy="22" r="4" fill={fg} />
                    <circle cx="36" cy="22" r="4" fill={fg} />
                    <circle cx="24" cy="36" r="4" fill={merge} />
                </>
            )}
            {d === 'small' && (
                <>
                    <path d="M11 37 V23 L24 11 L37 23 V37" stroke={fg} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="24" cy="11" r="5" fill={head} />
                    <circle cx="24" cy="35" r="5" fill={merge} />
                </>
            )}
            {d === 'tiny' && (
                <>
                    <path d="M10 38 V24 L24 11 L38 24 V38" stroke={fg} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="24" cy="34" r="6.5" fill={merge} />
                </>
            )}
        </svg>
    )
}

function BranchIcon({ size = 12 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <circle cx="6" cy="5" r="2.6" />
            <circle cx="6" cy="19" r="2.6" />
            <circle cx="18" cy="7" r="2.6" />
            <path d="M6 7.6V16.4" />
            <path d="M18 9.6Q18 14 6 16" />
        </svg>
    )
}

type LogoProps = {
    /** Alto del isotipo en px. Header: 40. */
    markSize?: number
    /** Muestra el chip "⎇ main.pe". Ocultar en espacios angostos (móvil). */
    showChip?: boolean
    /** 'auto' (default) sigue `body.dark-theme`. */
    variant?: LogoVariant
    className?: string
}

/** Lockup: isotipo + "devhaus" + chip "⎇ main.pe". Texto accesible "devhaus.pe". */
export function DevhausLogo({ markSize = 40, showChip = true, variant = 'auto', className }: LogoProps) {
    const bodyDark = useBodyDarkTheme()
    const onDark = resolveOnDark(variant, bodyDark)
    const fontSize = Math.round(markSize * 0.75)
    const ink = onDark ? 'var(--dh-on-dark, #FAF6F1)' : INK
    const chipColor = onDark ? 'var(--dh-yellow, #E9B949)' : ink
    return (
        <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: markSize * 0.25 }}>
            <DevhausMark size={markSize} inverse={onDark} />
            <span
                aria-hidden="true"
                style={{
                    fontFamily: 'var(--dh-font-display)',
                    fontSize,
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    color: ink
                }}
            >
                <span style={{ fontWeight: 500 }}>dev</span>
                <span style={{ fontWeight: 800 }}>haus</span>
            </span>
            {showChip && (
                <span
                    aria-hidden="true"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontFamily: 'var(--dh-font-mono)',
                        fontWeight: 700,
                        fontSize: Math.max(11, Math.round(fontSize * 0.4)),
                        padding: '3px 8px',
                        borderRadius: 7,
                        border: `1.5px solid ${chipColor}`,
                        color: chipColor
                    }}
                >
                    <BranchIcon size={Math.max(10, Math.round(fontSize * 0.38))} />
                    main.pe
                </span>
            )}
            <span className="sr-only">devhaus.pe</span>
        </span>
    )
}

export default DevhausLogo
