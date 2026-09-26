import { has, site } from '@/config/site'

// Número de WhatsApp (E.164 sin "+"). Sin default hardcodeado (spec R1.6):
// `VITE_WHATSAPP_NUMBER` (build-time) sobreescribe `site.contact.whatsapp`;
// si ambos están vacíos, `WHATSAPP_NUMBER` es `null` y los CTA que dependen
// de él no se renderizan.
const envNumber = import.meta.env.VITE_WHATSAPP_NUMBER
const configured = has(envNumber) ? envNumber : site.contact.whatsapp

export const WHATSAPP_NUMBER: string | null = has(configured) ? (configured as string) : null

export const isWhatsappConfigured = (): boolean => WHATSAPP_NUMBER !== null

export const buildWhatsappUrl = (text: string): string | null =>
    WHATSAPP_NUMBER
        ? `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}`
        : null
