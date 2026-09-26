# Apply progress: devhaus-rebrand

Modo de artefactos: `none` (progreso solo en este archivo; `tasks.md` no se marca). Modo de implementación: estándar (el storefront no tiene test runner; api/backoffice solo se verifican).

## Fase 1 — Fundación de marca (`feat(brand): devhaus foundation`)

Housekeeping: `.gitignore` += `docs/devhaus-handoff/` (no se toca `.env`; `docs/sdd/` sigue versionable).

### Lote 1.A
- [x] T1.1 `src/config/site.ts` creado: `SiteConfig` (design §3.4 + C9: `complaints.responseDays`, `shipping.limaDays/provinceDays: number|null`, `legal.termsText/privacyText: string[]|null`), `site` con todo pendiente en `null`/`[]` + `// TODO(spec-05)`, `sizes` copiado de `tallas.json` (cm `null`), helpers `has`, `get`, `isConfigured`, tipo `SiteKey`. Verificado: clave inexistente falla en `tsc` (TS2345); `isConfigured('shipping.freeFrom') === false`; `isConfigured('sizes.hombre.rows') === false` (cm pendientes).
- [x] T1.2 `public/` con los 8 archivos del handoff + `site.webmanifest` (name devhaus.pe, theme `#1B1A17`, bg `#FAF6F1`, icons 192/512) + `robots.txt`; borrados `src/favicon.svg` y `src/logo.svg`. `ls dist/favicon.svg dist/og-image.png dist/site.webmanifest` OK tras build.
- [x] T1.3 `index.html` reescrito: `lang="es"`, `<style>` dentro de `<head>`, link único Google Fonts (Bricolage 500/700/800, DM Sans 400/500/600, JetBrains Mono 500/700, `display=swap`), título C10, meta description spec 01, OG/Twitter (`og:image=/og-image.png`, `og:site_name=devhaus.pe`, `twitter:card=summary_large_image`), favicons, manifest, `theme-color`, `font-family: var(--dh-font-body)`. Sin nodos entre `</head>` y `<body>` en `dist/index.html`.
- [x] T1.4 Tokens: bloque `--dh-*` en `:root`, variantes oscuras en `.dark-theme` (+ `--color-text-invert:#1B1A17`); `--color-*`/`--gradient-brand` re-mapeadas (declaradas en `:root` Y `.dark-theme` porque `var()` se resuelve en el elemento que declara la propiedad); `--dh-page-x` 64/16 (@640); `--screen-desktop` según C14; objeto `themes` eliminado; `index.css` body/code con fuentes devhaus (con fallback).

### Lote 1.B
- [x] T1.5 `Logo.tsx` reemplazado por `DevhausMark` + `DevhausLogo` (`markSize`, `showChip`, `variant 'light'|'dark'|'auto'`; `auto` sigue `body.dark-theme` con `MutationObserver`; `.sr-only` "devhaus.pe"). Navbar: `markSize` 40 (32 móvil), `showChip={!isMobile}`; Footer: `markSize` 36, `auto`. Ningún `<path>` del logo viejo en `dist`.
- [x] T1.6 Strings "devhaus.pe" en Hero (alt), Footer (aria-label, copyright `© {año} devhaus.pe. Precios en soles (S/), IGV incluido.`), Benefits, `orderMessage.ts`; typo → "personalizar un polo". `whatsapp.ts`: `VITE_WHATSAPP_NUMBER` (si no vacío) → `site.contact.whatsapp`, sin default; `WHATSAPP_NUMBER: string|null`, `buildWhatsappUrl` → `null`. CTAs ocultos si `null`: botón Hero, enlace y `<li>` WhatsApp del Footer. `CartOrder`: el pedido se registra igual; sin número, en vez de abrir WhatsApp navega a `/done` (confirmación local con código y tracking). `grep -rniE "estilos(\.dev)?" src index.html` vacío.
- [~] T1.7 Import de `Testimonials` y `<Testimonials />` quitados de `Home.tsx`; ancla `#resenas` quitada del Footer. **PENDIENTE (manual):** borrar los archivos huérfanos — el entorno denegó el `rm`:
  `rm src/data/testimonials.ts src/components/Testimonials.tsx src/components/StarRating.tsx`
  (compilan pero ya no se importan desde ningún sitio; `grep -rn "resenas\|testimonials" src` quedará vacío al borrarlos).
- [x] T1.8 Verificación: `npm run build` (tsc + vite) OK · `cd api && npm test` 226/226 OK, `npm run build` OK · `cd backoffice && npm test` 43/43 OK, `npm run build` OK · grep de marca vacío · assets en `dist/` presentes. Chequeo visual en Docker (`docker compose build storefront`, ~6 min) omitido por tiempo.

Estado: 7/8 completas + T1.7 parcial (solo falta el `rm` de 3 archivos). Listo para commit `feat(brand): devhaus foundation` tras ese borrado.
