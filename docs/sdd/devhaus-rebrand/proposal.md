# Proposal: devhaus-rebrand

Basado en `docs/sdd/devhaus-rebrand/explore.md` y `docs/devhaus-handoff/`.

## Intent
Pasar la tienda de "Estilos" a **devhaus.pe**: nueva marca (logo, tokens, fuentes, assets, meta/OG), header/footer/legales exigidos en Perú (Libro de Reclamaciones), home + catálogo (spec 02), corte Hombre/Mujer (spec 04) y ficha de producto completa `/producto/:slug` (spec 03), sin perder las funciones actuales (posición del logo + flip, búsqueda, likes, sonidos/Lottie, tracking, carrito persistido) y sin inventar datos de negocio ni reseñas.

## Scope
### In
- `src/config/site.ts` con todos los `[placeholders]` (TODO, fragmentos ocultos si faltan).
- `public/` + fuentes + `DevhausLogo` + tokens `--dh-*` mapeados a `body.dark-theme` + meta/OG/manifest + strings.
- Announcement bar, header (nav, buscar, favoritos, tema, `Carrito · N`), footer 4 columnas, páginas Ayuda/FAQ, Guía de tallas, Envíos, Cambios, Términos, Privacidad.
- Libro de Reclamaciones: API (modelo, correlativo, POST público validado + rate limit, email SMTP opcional, listado admin) + página storefront + backoffice.
- Home/catálogo spec 02: hero, tiles con conteo real, orden, chips, dropdowns Stack/Color/Talla, filtros en URL, tarjeta nueva, skeleton/error correctos, personalización, barra de confianza, FAQ; eliminar reseñas falsas.
- Datos: `cuts` (polo), `slug` único editable, `soldOut`; migración idempotente; zod/DTO/seed; backoffice; carrito (persist v3), pedido, WhatsApp, tracking.
- Ficha `/producto/:slug` (spec 03/04) conservando posición del logo + flip; `/product/:id` redirige.
### Out
- Pasarela de pagos, stock por variante, reseñas backend, login/favoritos en servidor, fotos reales, licenciamiento de logos, Tailwind, tests unitarios del storefront (verificación = build).

## Approach
- Tokens: añadir `--dh-*` en `Theme.ts` (`:root` / `.dark-theme`) y re-apuntar `--color-*` a la paleta devhaus (explore A1).
- Contenedor 1152 vía `--screen-desktop` + `Container` compartido.
- Favoritos = `likes.likedList` persistido (explore F1); contador del servidor sigue en tarjeta.
- Tallas por corte = tabla global `tallas.json` compartida (C1); `sizes` por producto queda legado.
- Slug: slugify propio (sin dependencia nueva), índice único, lookup `$or {_id, slug}`.
- Ficha como ruta completa; JSON-LD/`document.title` por `useEffect` (B1).
- Copy de pago/envío condicionado a `site.payments.gateway`.

## Phases (un commit por fase)
Verificación estándar al cierre de cada fase: `npm run build` (raíz) · `cd api && npm test && npm run build` · `cd backoffice && npm test && npm run build`.

| # | Fase | Entregables clave | Commit |
|---|---|---|---|
| 1 | Fundación de marca | `site.ts`, `public/`, `index.html` (lang es, fuentes, meta/OG/manifest, `<style>` dentro de `<head>`), `DevhausLogo`, tokens, strings Estilos→devhaus (`Hero.tsx:295`, `Footer.tsx:146,172`, `Benefits.tsx:106`, `orderMessage.ts:48`), borrar `testimonials.ts` y sección, quitar default de WhatsApp | `feat(brand): devhaus foundation` |
| 2 | Shell | AnnouncementBar, Header/NavbarItems, Footer global en `App.tsx`, páginas estáticas con copy de `site.ts`, `Container` | `feat(layout): devhaus header, footer and help pages` |
| 2b | Libro de Reclamaciones | `Complaint` + `Counter`, `POST /api/complaints` (zod, rate limit, `RATE_LIMITED`), mailer nodemailer + `SMTP_*`/`COMPLAINTS_EMAIL` en `config.ts`, compose, `.env.example`; `GET /api/admin/complaints`; página `/libro-de-reclamaciones`; backoffice `/complaints`; tests api/backoffice | `feat(complaints): libro de reclamaciones` |
| 3 | Home + catálogo | `useProductsList` con `loading/error`, `Products.tsx` sin falso "0", tiles, orden (likes/createdAt/precio; exponer `createdAt` en DTO), filtros en `useSearchParams` sincronizados con el slice, tarjeta nueva, Customize/TrustBar/Faq | `feat(home): catalog per spec 02` |
| 4 | Modelo de datos | API schema+zod+DTO (`cuts`, `slug`, `soldOut`), `migrate-devhaus.ts`, seed, `ProductForm` (checkbox agotado, cortes, slug editable), storefront types/filtros por corte/`TShirt` mujer/cart v3/pedido/WhatsApp/tracking/backoffice OrderDetail | `feat(product): cut, slug and soldOut` |
| 5 | Ficha de producto | `ProductPage` (breadcrumb, galería procedural frente/espalda + flip, corte, color, talla, cantidad 1–10, agregado ✓, WhatsApp prellenado, entrega, acordeón, relacionados, sticky móvil, URL state, JSON-LD), redirección `/product/:id` | `feat(product-page): /producto/:slug` |

Fase 4 puede correr antes que 3 si el arte del corte mujer llega primero; 2b es independiente de 3–5.

## Affected Areas
| Area | Impact |
|---|---|
| `index.html`, `public/`, `src/Theme.ts`, `src/index.css`, `src/config/site.ts` | Nuevo/Modificado |
| `src/components/*` (Logo, Navbar, NavbarItems, Footer, Hero, Benefits, Products, Card, CategoryFilters, SearchBox, TShirt, CartOrder, ProductCart, LikeButton) | Modificado |
| `src/views/*` + nuevas vistas (ProductPage, legales, Libro) | Nuevo/Modificado |
| `src/store/*`, `src/types/*`, `src/data/*` | Modificado |
| `api/src/models/{Product,Order,Complaint,Counter}.ts`, `routes/*`, `middleware/*`, `mail/`, `scripts/*`, `config.ts`, tests | Nuevo/Modificado |
| `backoffice/src/{App,api/*,pages/*}` + tests | Nuevo/Modificado |
| `docker-compose.yml`, `.env.example` | Modificado (env SMTP) |

## Risks
| Riesgo | Prob. | Mitigación |
|---|---|---|
| Arte corte mujer inexistente | Alta | Derivar del path actual como placeholder; pedir arte al diseñador |
| Migración olvidada → `slug` vacío | Media | Script idempotente + test; ruta `/product/:id` sigue resolviendo |
| Copy de pagos sin pasarela | Media | Fragmentos condicionados a `site.payments.gateway` |
| Vite 2/TS 4.6 vs libs nuevas | Media | Sin deps nuevas en storefront; nodemailer solo en api |
| Cart persistido con ítems viejos | Baja | persist v3 normaliza `cut` |
| Regresión de layout en Cart/Tracking | Media | `Container` + variable global, revisión manual |

## Rollback
Cada fase es un commit atómico: `git revert <sha>`. Datos: la migración solo añade campos (`cuts`, `slug`, `soldOut`); revertir = `unset` + drop del índice `slug` (script inverso incluido en fase 4). Complaints es una colección nueva; se puede dejar.

## Dependencies (lo que debe aportar el usuario)
- Arte del corte mujer (path silueta + PNG base/filter frente y espalda) o aprobación de derivación.
- Datos de spec 05: razón social/RUC, correo y formato del Libro, textos legales, redes, horario, courier, días Lima/Provincias, monto envío gratis, pasarela, material/gramaje/técnica, medidas por talla, medidas mousepad / ml taza, días de cambio, horas de mockup, aclaración "Desde S/ 15".
- Credenciales SMTP para el correo del Libro (opcional; sin ellas se guarda el registro y se loguea).

## Success Criteria
- [ ] Ninguna aparición de "Estilos"/"estilos.dev" en `src`, `index.html`, mensajes WhatsApp.
- [ ] Build raíz y `npm test` + `npm run build` en api y backoffice en verde al final de cada fase.
- [ ] Catálogo muestra skeleton solo cargando y estado de error real; filtros/orden en URL.
- [ ] `/producto/:slug` funciona con corte/color/talla en URL y JSON-LD; `/product/:id` redirige.
- [ ] Posición del logo + flip, búsqueda, likes, sonidos, tracking y carrito persistido siguen funcionando.
- [ ] Libro de Reclamaciones devuelve número correlativo y aparece en backoffice.
- [ ] Ningún valor de negocio inventado: todo placeholder vive en `site.ts` con TODO y se oculta si falta.
