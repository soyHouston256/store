# Design: devhaus-rebrand

Basado en `proposal.md`, `explore.md` y `docs/devhaus-handoff/` (specs 01–05, `brand/tokens.css`, `brand/components/Logo.tsx`, `specs/data/tallas.json`, `reference/canvas/*.dc.html`). Código leído: `src/Theme.ts`, `src/App.tsx`, `src/store/**`, `src/type.d.ts`, `src/types/ProductType.ts`, `src/data/{typeConfig,orderMessage,OrderService,ProductService,whatsapp,colorNames,logoPositions}.ts(x)`, `src/components/{TShirt,ProductVisual,Card,Products,CategoryFilters,SearchBox,Navbar,NavbarItems,ThemeSwitch,CartOrder}.tsx`, `src/views/{Product,Home,Tracking}.tsx`, `api/src/{app,config,index}.ts`, `api/src/models/*`, `api/src/routes/*`, `api/src/middleware/*`, `api/src/scripts/seed-products.ts`, `backoffice/src/{App.tsx,api/*,pages/ProductForm.tsx}`, `docker-compose.yml`, `.env.example`, `Dockerfile`, `api/Dockerfile`.

## 1. Enfoque técnico

Cinco commits atómicos (fases 1, 2, 2b, 3, 4, 5 del proposal). Principios transversales:

| Principio | Cómo se aplica |
|---|---|
| Sin dependencias nuevas en el storefront (Vite 2 / TS 4.6) | slugify, JSON-LD, URL state y rate limit son implementaciones propias; solo `nodemailer` entra en `api/`. |
| Nombres de campo en inglés, valores en español | Campos `cuts`, `cut`, `slug`, `soldOut` (coherentes con `colors`, `sizes`, `logoPositions`); valores `'hombre' \| 'mujer'`; parámetros de URL `corte`, `talla`, `cat`, `orden` (spec 02/03). |
| Los datos de negocio viven en `src/config/site.ts` | Todo `[PLACEHOLDER]` es `null` con `// TODO`; el fragmento de UI que dependa de él se oculta con `isConfigured()`. |
| Una fuente de verdad por estado | Filtros del catálogo: la URL manda, Redux deriva. Corte en ficha: URL manda. Tema: `body.dark-theme` sigue mandando. |
| Migración aditiva e idempotente | `migrate-devhaus.ts` solo añade campos/índice; script inverso incluido. |

## 2. Decisiones de arquitectura

| # | Decisión | Elegido | Alternativas descartadas | Razón |
|---|---|---|---|---|
| A1 | Tokens | `--dh-*` dentro de `GlobalStyles` (`:root` + `.dark-theme`) y `--color-*` re-apuntadas con `var(--dh-*)` | Importar `tokens.css` tal cual y reescribir `[data-theme]` | Sin CSS extra ni doble paleta viva; los ~20 componentes viejos heredan la marca sin tocarlos; `ThemeSwitch` no cambia. |
| A2 | Ancho | `--screen-desktop: min(1152px, calc(100% - 2 * var(--dh-page-x)))` + componente `Container` para lo nuevo | Reescribir cada `width: var(--screen-desktop)` | Cart/Tracking (no rediseñados) reciben el contenedor 1152 sin edición; los nuevos usan `Container`. |
| B1 | Ficha | Ruta completa `/producto/:slug`; el modal `views/Product.tsx` desaparece | Mantener modal + página | Dos UIs para lo mismo; el modal no puede cumplir spec 03 (breadcrumb, relacionados, sticky, JSON-LD). |
| B2 | Lookup | `GET /api/products/:idOrSlug` con `$or` | Ruta nueva `/api/products/by-slug/:slug` | `useProductById` y `LegacyProductRedirect` reutilizan el mismo endpoint; `/product/:id` sigue resolviendo. |
| C1 | Tallas | Tabla global por corte (`tallas.json`) duplicada como módulo TS en api/storefront/backoffice; `sizes` por producto queda legado (ignorado para polos) | Módulo compartido en raíz del repo; `sizesByCut` por producto | Los tres paquetes tienen contextos Docker distintos (`api/Dockerfile` copia solo `src`); un test en api compara el módulo con el JSON. |
| C2 | Filtros en URL | `useSearchParams` es la fuente; un solo hook (`useCatalogUrlSync`) sincroniza → Redux | Redux fuente + espejo a URL | Evita bucles de sincronización bidireccional y hace las URLs compartibles/deep-linkables. |
| D1 | Migración | Script idempotente (`updateMany` + `bulkWrite` de slugs + `createIndex` parcial único) | Solo defaults de schema | `slug` único no puede ser default; el índice parcial (`slug: {$type:'string'}`) tolera docs intermedios sin slug. |
| E1 | Libro | `Complaint` + `Counter` atómico + rate limit in-memory + nodemailer opcional | Solo email; `express-rate-limit` | Indecopi exige registro y correlativo; una sola réplica en compose hace innecesario un store compartido. |
| F1 | Favoritos | Reusar `likes.likedList` (persistido) | Slice `favorites` | Ya es la lista local de ids marcados; evita duplicar estado. |
| G1 | Arte mujer | Registro `TSHIRT_ART[cut]` con fallback explícito al arte hombre (`isPlaceholder: true`) | `transform: scaleX(.9)` del arte actual | Distorsiona el logo y se ve falso; el flag permite avisar en UI y cambiar solo assets cuando lleguen. |
| H1 | Carrito | Deduplicar por `id+cut+color+size+logoPosition`; `_id` sigue siendo id de línea | Mantener quirk (línea nueva por cada agregar) | Al añadir `cut` la deduplicación correcta es barata y corrige el quirk documentado en explore. |

## 3. Fase 1 — Fundación de marca

### 3.1 Tokens (`src/Theme.ts`)

```ts
// :root — bloque literal de brand/tokens.css (--dh-*) + re-mapeo:
--color-background: var(--dh-bg);        --color-neutral: var(--dh-surface);
--color-neutral-light: var(--dh-sand);   --color-text: var(--dh-ink);
--color-text-invert: var(--dh-on-dark);  --color-accent: var(--dh-accent);
--color-accent-light: var(--dh-sand);    --color-surface: var(--dh-surface);
--color-surface-light: var(--dh-sand-2); --color-border: var(--dh-line);
--color-border-dark: var(--dh-line-2);   --color-border-solid: var(--dh-line-2);
--color-warning: var(--dh-yellow);       --color-warning-light: var(--dh-sand);
--gradient-brand: var(--dh-accent);      /* h1 sin degradado (spec 02) */
--screen-desktop: min(1152px, calc(100% - 2 * var(--dh-page-x)));
--dh-page-x: 64px;  /* 16px en @media (max-width: 640px) */
```
- `.dark-theme { … }` recibe el bloque `[data-theme="dark"]` de `tokens.css` más `--color-text-invert: #1B1A17`. El objeto `themes` de `Theme.ts` se elimina.
- `body, button, input, select, textarea { font-family: var(--dh-font-body) }` en `index.html`; `src/index.css` body → `var(--dh-font-body)`; `code` → `var(--dh-font-mono)`.
- `index.html`: `lang="es"`, `<style>` movido dentro de `<head>`, link único de Google Fonts (el de la cabecera de `tokens.css`, con `display=swap`), `<title>`, `meta description`, OG/Twitter (`og:image=/og-image.png`, `og:site_name=devhaus.pe`), favicons y `<link rel="manifest" href="/site.webmanifest">`, `<meta name="theme-color" content="#1B1A17">`.

### 3.2 `public/` (nuevo, raíz)
Copiar `docs/devhaus-handoff/public/*` → `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `logo.svg`, `logo-dark.svg`, `og-image.png`; crear `site.webmanifest` (`name: devhaus.pe`, `theme_color #1B1A17`, `background_color #FAF6F1`, icons 192/512) y `robots.txt`. Vite 2 copia `public/` a `dist/` sin configuración; `Dockerfile` ya hace `COPY . .`. Borrar `src/favicon.svg` y `src/logo.svg`.

### 3.3 Logo
`src/components/Logo.tsx` se reemplaza por el contenido de `brand/components/Logo.tsx` (exporta `DevhausMark` y `DevhausLogo`; `.sr-only` ya existe en `App.css`). Header: `<DevhausLogo markSize={40} showChip={!isMobile} />`; footer: `onDark={false}` sobre `--dh-sand-2`.

### 3.4 `src/config/site.ts`

```ts
export type Cut = 'hombre' | 'mujer'
export interface SizeRow { talla: string; anchoPechoCm: number | null; largoCm: number | null }
export interface SiteConfig {
  brand: { name: 'devhaus.pe'; domain: string; tagline: string }
  legal: { businessName: string | null; ruc: string | null; termsText: string[] | null; privacyText: string[] | null }
  contact: { whatsapp: string | null /* VITE_WHATSAPP_NUMBER, sin default */; hours: string | null }
  social: { instagram: string | null; tiktok: string | null; other: { label: string; url: string }[] }
  shipping: { courier: string | null; hasTracking: boolean | null; limaDays: string | null; provinceDays: string | null; freeFrom: number | null }
  payments: { gateway: string | null; yapePlinIntegrated: boolean | null }
  product: { material: string | null; grammage: string | null; prewashed: boolean | null; printTechnique: string | null;
             mousepadSize: string | null; mugMl: number | null; showSku: boolean; modelHeightCm: number | null; modelSize: string | null }
  sizes: Record<Cut, { label: string; description: string; rows: SizeRow[] }>   // de tallas.json; medidas null
  customization: { fromPrice: number; priceIsSurcharge: boolean | null; mockupHours: number | null }
  returns: { days: number | null; conditions: string | null }
  promos: { freeStickers: number | null }   // hoy "4 stickers" hardcodeado en CartOrder.tsx
  reviews: { source: string | null }
}
export const site: SiteConfig = { /* cada null lleva // TODO(spec 05) */ }

type Paths<T, P extends string = ''> = { [K in keyof T & string]:
  T[K] extends object ? (T[K] extends any[] ? `${P}${K}` : Paths<T[K], `${P}${K}.`>) : `${P}${K}` }[keyof T & string]
export type SiteKey = Paths<SiteConfig>
export function get<K extends SiteKey>(key: K): unknown
/** true solo si el valor no es null/undefined, no es '' ni [] y (número) no es NaN. Medidas: true solo si TODAS las filas tienen cm. */
export function isConfigured(key: SiteKey): boolean
```
Uso: `{isConfigured('shipping.freeFrom') && <span>Gratis desde S/ {site.shipping.freeFrom}</span>}`. Copy prohibido sin pasarela (`payments.gateway`): "tarjeta", "Envío se calcula al pagar". `whatsapp.ts` deja de tener default; `buildWhatsappUrl` devuelve `undefined` y los botones de WhatsApp se ocultan si no hay número.

### 3.5 Strings
`Hero.tsx:295`, `Footer.tsx:146,172`, `Benefits.tsx:106`, `orderMessage.ts:48` → devhaus.pe. Borrar `src/data/testimonials.ts`; `Testimonials.tsx` recibe `reviews: Review[]` y devuelve `null` si está vacío (sin backend → nunca se renderiza; ancla `#resenas` se quita del footer).

## 4. Fase 2 — Shell

```
App.tsx
 └─ <Layout>                       src/components/layout/Layout.tsx
     ├─ <AnnouncementBar/>         40px, --dh-ink; fragmentos condicionados (freeFrom, gateway)
     ├─ <Header/>                  84px (reemplaza Navbar.tsx; conserva NavbarItems sonidos/Lottie)
     │    ├─ DevhausLogo · nav · "Sigue tu pedido" · SearchButton · FavoritesButton(likedList.length) · ThemeSwitch · CartPill "Carrito · N"
     │    └─ <MobileMenu/>          hamburguesa ≤1024, showChip=false
     ├─ <main><Routes/></main>
     └─ <Footer/>                  global (hoy solo en Home.tsx); 4 columnas; RUC/razón social solo si configurados
```
- `Container` (`src/components/layout/Container.tsx`): `max-width: 1152px; margin: 0 auto; padding: 0 var(--dh-page-x)`.
- Nav: Polos `/?cat=polo#catalogo`, Mousepads `/?cat=mousepad#catalogo`, Tazas `/?cat=taza#catalogo`, Personaliza `/#personaliza`, Ayuda `/ayuda`.
- Páginas estáticas: un componente `StaticPage` (`src/views/static/StaticPage.tsx`) que recibe `{ title, sections: { heading, body: ReactNode, show?: boolean }[] }`; contenidos en `src/content/pages.tsx` (FAQ con textos de spec 05 y placeholders condicionados). Rutas: `/ayuda`, `/guia-de-tallas` (tabla por corte solo si `isConfigured('sizes.hombre')`), `/envios`, `/cambios`, `/terminos`, `/privacidad`, `/favoritos`.
- `/favoritos` (`src/views/Favorites.tsx`): `products.filter(p => likedList.includes(p.id))` con el mismo `Card`.

## 5. Fase 2b — Libro de Reclamaciones

### 5.1 Modelos
```ts
// api/src/models/Counter.ts
{ _id: String /* 'complaints-2026' */, seq: { type: Number, default: 0 } }
export async function nextSequence(key: string): Promise<number>   // findOneAndUpdate $inc, upsert, new

// api/src/models/Complaint.ts  (_id ObjectId por defecto; timestamps)
code: { type: String, required: true, unique: true }               // 'LR-2026-000001'
consumer: { name, docType: enum ['DNI','CE','PASAPORTE'], docNumber, email, phone, address? }
guardianName?: String                                               // menor de edad
item: { kind: enum ['producto','servicio'], description: String, amount?: Number }
claim: { type: enum ['reclamo','queja'], detail: String, request: String }
orderId?: String
status: { type: String, enum: ['nuevo','atendido'], default: 'nuevo' }
emailSent: { type: Boolean, default: false }
ip?: String
ComplaintSchema.index({ createdAt: -1 })
```
Correlativo: `formatCode(prefix, year, seq) = `${prefix}-${year}-${String(seq).padStart(6,'0')}``; `prefix` = `config.complaints.codePrefix` (`COMPLAINTS_CODE_PREFIX`, default `LR`); el contador se reinicia por año (clave `complaints-${year}`).

### 5.2 Endpoints
| Método/Ruta | Auth | Middleware | Respuesta |
|---|---|---|---|
| `POST /api/complaints` | pública | `rateLimit({ windowMs: 15*60e3, max: 5 })`, `validate(ComplaintCreateSchema)` | 201 `{ id, code, createdAt, emailSent }`; 429 `RATE_LIMITED` |
| `GET /api/admin/complaints?status=` | JWT | — | `ComplaintDTO[]` newest first (patrón `orders.admin.ts`) |
| `GET /api/admin/complaints/:id` | JWT | — | `ComplaintDTO` |
| `PATCH /api/admin/complaints/:id/status` | JWT | `validate({status})` | `ComplaintDTO` |

`ComplaintCreateSchema` (zod): strings `trim().min(1).max(…)` (detail/request `max(2000)`), `email().max(120)`, `docNumber` `regex(/^[A-Za-z0-9-]{6,15}$/)`, `amount` `number().nonnegative().optional()`, `orderId` `regex(/^[A-Z0-9]{8}$/i).optional()`, `acceptsTerms: z.literal(true)`. Flujo: validar → `nextSequence` → `Complaint.create` → intentar correo → 201 (el correo nunca hace fallar la creación).

### 5.3 Rate limit (`api/src/middleware/rateLimit.ts`)
Factory `rateLimit({ windowMs, max, now = Date.now })` con `Map<ip,{count,resetAt}>`; poda entradas vencidas en cada llamada; al exceder lanza `new HttpError('RATE_LIMITED', 'Too many requests')` y fija `Retry-After`. `errorHandler.ts`: añadir `RATE_LIMITED: 429`. `app.ts`: `app.set('trust proxy', 1)` (Caddy pone `X-Forwarded-For`). Test con `now` inyectado.

### 5.4 Mailer (`api/src/mail/mailer.ts`)
`createMailer(config.smtp): Mailer | null` — `null` si falta `SMTP_HOST`. `sendComplaintEmail(mailer, complaint)` envía a `COMPLAINTS_EMAIL` con copia al consumidor (obligatorio por norma); plantilla texto/HTML en `api/src/mail/templates/complaint.ts`. Sin SMTP: `console.warn('[complaints] SMTP no configurado; LR-… guardado sin correo')`, `emailSent:false`; el storefront muestra el código y omite "te enviamos una copia".

Config (`api/src/config.ts`, todas opcionales, `REQUIRED` no cambia): `SMTP_HOST`, `SMTP_PORT` (587), `SMTP_SECURE` (false), `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `COMPLAINTS_EMAIL`, `COMPLAINTS_CODE_PREFIX` (LR). Añadir a `.env.example` (comentadas) y a `docker-compose.yml` `api.environment` con `${VAR:-}`.

### 5.5 UI
- Storefront `src/views/LibroReclamaciones.tsx`: cabecera con razón social/RUC (si configurados), formulario con secciones legales (consumidor, bien contratado, reclamo/queja, detalle, pedido), éxito con `code` grande; 429 → "Demasiados envíos, inténtalo en unos minutos".
- Backoffice: `pages/ComplaintList.tsx` (`/complaints`, filtro estado, columnas Código/Fecha/Consumidor/Tipo/Estado) y `pages/ComplaintDetail.tsx` (`/complaints/:id`, botón "Marcar atendido"); `api/client.ts`: `listComplaints`, `getComplaint`, `setComplaintStatus`; `types.ts`: `ComplaintDTO`. Enlace junto a "Pedidos" en la navegación existente.

## 6. Fase 3 — Home y catálogo

### 6.1 Carga
`useProductsList` → `{ products, loading, error, reload }` (try/catch de `ApiError`). `Products.tsx`: skeleton solo con `loading`; `error` → bloque con "Reintentar"; conteo y "Ver los N diseños" solo con data.

### 6.2 Filtros en URL
| Param | Valores | Estado Redux (`filters`) |
|---|---|---|
| `q` | texto | `term` |
| `cat` | `polo\|mousepad\|taza` | `category` |
| `corte` | `hombre\|mujer` | `cut` (default: `localStorage['dh-corte']` ?? `'hombre'`) |
| `orden` | `vendidos\|novedades\|precio` | `sort` (default `vendidos`) |
| `stack` | clave de `productLogos` (`docker`, `react`…) | `stack` |
| `color` | slug de `nearestColorName` (`negro`) o hex sin `#` | `color` |
| `talla` | de `sizesFor(cut)` | `size` |

- Hook único `useCatalogUrlSync()` montado en `Products.tsx`: lee `useSearchParams`, normaliza, `dispatch(setFilters(parsed))`; si `corte` falta y hay `localStorage`, lo escribe en la URL con `replace`. Chips/segmented/dropdowns/SearchBox llaman `setSearchParams` (nunca `dispatch` directo). `SearchBox` debounce 250 ms → `q`.
- Slice `products/index.ts`: `filters: { term, category?, cut, sort, stack?, color?, size? }`; `applyFilters` ordena: `vendidos` = `likes` desc, `novedades` = `createdAt` desc (nuevo en DTO), `precio` = `price` asc. Corte: polos sin el corte activo se muestran con meta "Solo corte hombre" (default de explore Q1). Talla filtra solo polos (`sizesFor(cut).includes(size)` — la talla es por tabla, no por producto).
- Componentes: `CategoryTiles.tsx` (conteo desde `state.products.products`), `CategoryFilters.tsx` (chips + `CutSegmented` + `FilterDropdown` Stack/Color/Talla), `SortSelect`, `Card.tsx` nuevo (imagen 300 en `--dh-sand`, badge "Más vendido" si `likes>=3` / "Nuevo" si `createdAt` < 30 días, favorito 44, puntos de color 14, meta por tipo, precio Bricolage 20/700, `+` navega a `/producto/${slug}`), `Customize.tsx` (`#personaliza`), `TrustBar.tsx` (reemplaza `Benefits.tsx`), `Faq.tsx`. Cada fragmento con placeholder pasa por `isConfigured`.

## 7. Fase 4 — Modelo de datos (cut / slug / soldOut)

### 7.1 API
```ts
// api/src/models/Product.ts
export const CUTS = ['hombre', 'mujer'] as const; export type Cut = (typeof CUTS)[number];
slug:    { type: String, trim: true, lowercase: true },
cuts:    { type: [{ type: String, enum: CUTS }], default: undefined },
soldOut: { type: Boolean, default: false },
ProductSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { slug: { $type: 'string' } } });
export function cutsFor(type, cuts) { return type !== 'polo' ? [] : (cuts?.length ? uniq(cuts) : ['hombre']) }
// ProductDTO += slug: string; cuts: Cut[]; soldOut: boolean; createdAt: string
```
- `api/src/models/slug.ts`: `slugify(name)` (NFD, sin diacríticos, `[^a-z0-9]+`→`-`, trim `-`, max 60) y `ensureUniqueSlug(base, taken: Set<string>)` (sufijos `-2`, `-3`…).
- `api/src/models/sizes.ts`: `SIZES_BY_CUT: Record<Cut, string[]>` (copiado de `tallas.json`; test lo compara con `../../docs/devhaus-handoff/specs/data/tallas.json`).
- zod `ProductWriteSchema` += `slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(60).optional()`, `cuts: z.array(z.enum(CUTS)).min(1).max(2).optional()`, `soldOut: z.boolean().optional()`. POST: `slug ?? ensureUniqueSlug(slugify(name), existentes)`; PUT: `slug` omitido → se conserva; slug duplicado → 400 `VALIDATION` `{field:'slug', message:'Slug already in use'}` (verificación previa + captura de `E11000`). `cuts` se normaliza con `cutsFor`; `sizes` sigue aceptándose (legado).
- `products.public.ts`: `GET /:idOrSlug` → `findOne({ published: true, $or: [{ _id: p }, { slug: p.toLowerCase() }] })`. Admin `GET /:id` no cambia.
- `orders.public.ts`: item `cut: z.enum(CUTS).optional()`; validación: producto `soldOut` → 400; polo con `cut` ∉ `cutsFor(product)` → 400; polo sin `cut` → `cuts[0]`; snapshot guarda `cut`. `Order.ts`: `cut` en `OrderItemSchema`, `OrderDTO`, `OrderTrackingDTO`.

### 7.2 Migración (`api/src/scripts/migrate-devhaus.ts`, exporta `migrateDevhaus()` y `rollbackDevhaus()`)
1. `updateMany({type:'polo', cuts:{$exists:false}}, {$set:{cuts:['hombre']}})`; `updateMany({type:{$ne:'polo'}, cuts:{$exists:false}}, {$set:{cuts:[]}})`.
2. `updateMany({soldOut:{$exists:false}}, {$set:{soldOut:false}})`.
3. `taken = new Set(slugs existentes)`; para cada doc sin `slug` (orden `createdAt asc, _id asc`): `ensureUniqueSlug(slugify(name), taken)` → `bulkWrite updateOne`.
4. `Product.collection.createIndex({slug:1},{unique:true, partialFilterExpression:…})`.
Devuelve `{ cutsSet, soldOutSet, slugsSet }`; segunda ejecución → todo 0 (test). `rollbackDevhaus`: `$unset {cuts, slug, soldOut}` + `dropIndex('slug_1')`. CLI: `node dist/scripts/migrate-devhaus.js [--down]`; compose: `docker compose run --rm api node dist/scripts/migrate-devhaus.js`.

### 7.3 Seed
`$setOnInsert` += `cuts: cutsFor(type, p.cuts)`, `soldOut: false`, `slug: ensureUniqueSlug(p.slug ?? slugify(p.name), taken)` con `taken` cargado de la DB antes del `bulkWrite` (evita `E11000`). `SeedProductSchema` += `slug`, `cuts` opcionales. `products.json` no se toca.

### 7.4 Storefront
- `ProductType` += `slug?, cuts?, soldOut?, createdAt?`; `ProductCartType` += `cut?: Cut`. `src/data/sizes.ts` (`sizesFor(cut)`), `src/data/cuts.ts` (`CUT_LABELS`, `CUT_META` "Hombre · corte recto · S–XXL"), `src/data/slug.ts` (mismo algoritmo, para previews).
- `typeConfig.tsx`: `hasCuts: boolean` (`polo: true`), `required: ['cut','size','logoPosition']`; `VisualProps` += `cut?`.
- `cart.ts`: dedupe `item.id === p.id && item.cut === p.cut && item.color === p.color && item.size === p.size && normalizeLogoPosition(item.logoPosition) === normalizeLogoPosition(p.logoPosition)`; `quantity` tope 10.
- `store/index.ts` persist `version: 3`; migración `3: state => ({...state, cart: { productsCart: state.cart.productsCart.map(i => (i.type ?? 'polo') === 'polo' && !i.cut ? {...i, cut:'hombre'} : i) }})`.
- `OrderService.toOrderItem` envía `cut`; `orderMessage.itemAttributes` antepone `CUT_LABELS[cut]`; `Tracking.tsx` y `ProductCart.tsx` muestran corte; `CartOrder.tsx` usa `site.shipping.freeFrom` / `site.promos.freeStickers`.
- Favoritos: `LikeProduct` sin cambios (ya escribe `likedList` + contador servidor).

### 7.5 Backoffice
`types.ts` `ProductDTO/ProductWriteDTO` += `slug, cuts, soldOut`; `OrderItemDTO` += `cut`. `ProductForm.tsx`: input `slug` (prellenado con `slugify(name)` en creación; editable; regex en cliente), checkboxes "Cortes" (solo `polo`, mínimo 1), checkbox "Agotado"; `TagInput` de tallas oculto para `polo` (hint "Las tallas de polos vienen de la tabla por corte"). `ProductList.tsx` columna Slug/Agotado. `OrderDetail.tsx` tag `Corte {label}`. Tests: `ProductForm.test.tsx` (nuevos campos), `ComplaintList.test.tsx`.

## 8. Fase 5 — Ficha `/producto/:slug`

### 8.1 Rutas (`src/App.tsx`)
```tsx
<Route path="/" element={<Home />} />                       {/* Home.tsx pierde <Outlet/> y <Footer/> */}
<Route path="/producto/:slug" element={<ProductPage />} />
<Route path="/product/:id" element={<LegacyProductRedirect />} />   {/* getProduct(id) → <Navigate replace to={`/producto/${p.slug ?? p.id}`}/>; 404 → "/" */}
```
Se elimina `location.state.background` y el segundo `<Routes>`. `Card` navega a `/producto/${product.slug ?? product.id}` (el API acepta ambos).

### 8.2 Reutilización de `views/Product.tsx`
Se extrae a `src/components/product/`: `useProductSelection(product)` (estado `cut,color,size,logoPosition,isFlipped,quantity`, `missingFields`, `selectLogoPosition` que fija `isFlipped = isBackLogoPosition(position)` — comportamiento actual preservado), `LogoPositionPicker` (mueve `LogoPositionIcon` + opciones), `FlipButton`, `CutSelector` (spec 04: 2 columnas, 64 alto, silueta 36 de `src/data/siluetas.ts`), `ColorSwatches`, `SizePills`, `QuantityStepper`. `views/Product.tsx` se borra; `useProductById` → `useProduct(idOrSlug)` con `loading/error` y deps `[idOrSlug]`.

### 8.3 `src/views/ProductPage.tsx`
```
Breadcrumb (Inicio / {Tipo} / {Nombre})
┌ Galería 640 ───────────────┐ ┌ Compra ─────────────────────────────────┐
│ thumbs 84×100: Frente,     │ │ H1 40/800 · meta {Corte} · material · SKU│
│ Espalda (procedurales via  │ │ Precio 34/700 · "IGV incluido"           │
│ ProductVisual isFlipped)   │ │ CutSelector → ColorSwatches 44 →         │
│ + Foto modelo / Detalle    │ │ LogoPositionPicker (preservado) →        │
│ solo si product.images     │ │ SizePills 60×48 + "Guía de tallas"       │
│ main 660, radio 24, badge  │ │ Cantidad 1–10 + CTA 52 "Agregar · S/ …"  │
│ FlipButton si logo trasero │ │ → "Agregado ✓ · Ir al carrito"           │
└────────────────────────────┘ │ WhatsApp personalizar · Caja entrega ·   │
                               │ Acordeón (Descripción/Material/Envíos)   │
"Completa el setup" (4 relacionados)      └─────────────────────────────┘
Sticky móvil ≤640: precio + Agregar (fixed bottom, padding-bottom en la página)
```
- URL state: `?corte=&color=&talla=&logo=` con `setSearchParams(…, { replace: true })`; `color` = slug de `nearestColorName(hex)` con fallback hex sin `#`, resuelto contra `product.colors`; `talla` inválida para el corte → `'M'` si existe, si no la primera; `corte` default `localStorage['dh-corte']` si ∈ `product.cuts`, si no `cuts[0]`.
- "Agregar": `soldOut` → botón deshabilitado "Agotado"; `missingFields` marca requeridos como hoy; éxito muestra "Agregado ✓ · Ir al carrito" 4 s sin `navigate(-1)`.
- Relacionados: `state.products.products` mismo `type`, sin el actual, `likes` desc, 4 (App ya carga la lista; no hay endpoint nuevo).
- SEO: `useEffect` → `document.title = `${name} · devhaus.pe`` y `<script type="application/ld+json" id="product-jsonld">` con `{ "@type":"Product", name, image: [logo abs ?? og-image], sku?, offers:{ price: price.toFixed(2), priceCurrency:'PEN', availability: soldOut ? OutOfStock : InStock, url } }`; se limpia al desmontar.
- WhatsApp: mensaje `Hola devhaus.pe, quiero personalizar "{name}" (corte {Corte}, color {Color}, talla {T})`.

### 8.4 Corte mujer en `TShirt.tsx`
```ts
// src/data/tshirtArt.ts
export interface TShirtArt { viewBox: string; path: string; front: { base: string; filter: string }; back: { base: string; filter: string }; placement: Record<LogoPosition, {…%}>; isPlaceholder?: boolean }
export const TSHIRT_ART: Record<Cut, TShirtArt> = {
  hombre: { /* assets y path actuales de TShirt.tsx; placement = valores % actuales */ },
  mujer:  { ...HOMBRE, isPlaceholder: true },   // hasta recibir arte: misma silueta
}
```
`TShirt` recibe `cut` y lee `TSHIRT_ART[cut ?? 'hombre']`; cuando lleguen los assets solo se reemplaza la entrada `mujer` (y opcionalmente `placement`). Convención a pedir al diseñador (misma lienzo 1200×1349 para conservar los % del logo): `src/assets/images/t-shirt/mujer/base.png`, `filter.png`, `base-back.png`, `filter-back.png` y `outline.svg` (path único, `viewBox="0 0 1200 1349"`). El ícono del selector usa `SILUETA` de `specs/data/siluetas.ts` (copiado a `src/data/siluetas.ts`).

## 9. Cambios por archivo (resumen)

| Área | Crear | Modificar | Borrar |
|---|---|---|---|
| Raíz | `public/*`, `public/site.webmanifest` | `index.html`, `.env.example`, `docker-compose.yml` | `src/favicon.svg`, `src/logo.svg` |
| Storefront config/data | `src/config/site.ts`, `src/content/pages.tsx`, `src/data/{sizes,cuts,slug,siluetas,tshirtArt}.ts` | `Theme.ts`, `index.css`, `whatsapp.ts`, `orderMessage.ts`, `OrderService.ts`, `ProductService.ts`, `typeConfig.tsx`, `types/ProductType.ts`, `type.d.ts` | `data/testimonials.ts` |
| Storefront store | — | `store/index.ts` (v3), `slices/products/{index,cart}.ts` | — |
| Storefront componentes | `layout/{Layout,Container,AnnouncementBar,Header,MobileMenu}.tsx`, `CategoryTiles`, `CutSegmented`, `FilterDropdown`, `SortSelect`, `Customize`, `TrustBar`, `Faq`, `product/*` | `Logo`, `Footer`, `Hero`, `Products`, `Card`, `CategoryFilters`, `SearchBox`, `TShirt`, `ProductVisual`, `CartOrder`, `ProductCart`, `NavbarItems`, `Testimonials` | `Navbar.tsx` (→Header), `Benefits.tsx` |
| Storefront vistas | `ProductPage`, `LegacyProductRedirect`, `Favorites`, `LibroReclamaciones`, `static/*` | `Home`, `Tracking`, `App.tsx` | `views/Product.tsx` |
| API | `models/{Complaint,Counter,slug,sizes}.ts`, `routes/complaints.{public,admin}.ts`, `middleware/rateLimit.ts`, `mail/*`, `scripts/migrate-devhaus.ts` + tests | `models/{Product,Order}.ts`, `routes/{products.public,products.admin,orders.public}.ts`, `middleware/errorHandler.ts`, `config.ts`, `app.ts`, `scripts/seed-products.ts`, `package.json` (nodemailer) | — |
| Backoffice | `pages/{ComplaintList,ComplaintDetail}.tsx`, `api/slug.ts` + tests | `App.tsx`, `api/{client,types}.ts`, `pages/{ProductForm,ProductList,OrderDetail}.tsx` | — |

## 10. Docker / build / verificación

- Sin build args nuevos. `public/` lo copia Vite; `Dockerfile` raíz no cambia. `api/Dockerfile`: `npm ci` incorpora `nodemailer` sin cambios. `docker-compose.yml`: variables SMTP/COMPLAINTS en `api.environment` con default vacío; `app.set('trust proxy', 1)`.
- Post-deploy fase 4: `docker compose run --rm api node dist/scripts/migrate-devhaus.js` (antes del seed en DB vacía es indiferente: el seed ya genera slugs).

| Fase | Verificación |
|---|---|
| Todas | `npm run build` (raíz) · `cd api && npm test && npm run build` · `cd backoffice && npm test && npm run build` |
| 1 | `grep -ri "estilos" src index.html` vacío; `ls dist/favicon.svg dist/og-image.png dist/site.webmanifest` |
| 2 | Rutas `/ayuda`, `/terminos`, `/favoritos` renderizan con footer global; Cart/Tracking sin regresión de ancho |
| 2b | `curl -XPOST /api/complaints` ×6 → sexto 429; sin SMTP → 201 `emailSent:false` y warn en log; backoffice `/complaints` lista |
| 3 | `/?cat=polo&corte=mujer&orden=precio` recarga con filtros aplicados; API caída → estado de error, no "0 diseños" |
| 4 | `migrate-devhaus` dos veces → segunda `{0,0,0}`; `GET /api/products/redis` = `GET /api/products/0utzWxB9wGfCW1G7P9JI`; carrito viejo rehidrata con `cut:'hombre'` |
| 5 | `/product/<id>` → 301 cliente a `/producto/<slug>`; `?corte=mujer&color=negro&talla=M` persiste; `document.head` contiene `#product-jsonld`; flip + posición del logo funcionan |

## 11. Estrategia de pruebas

| Capa | Qué | Cómo |
|---|---|---|
| API unit/integration (vitest + mongodb-memory-server) | `slug.test.ts` (slugify, colisiones), `migrate-devhaus.test.ts` (idempotencia, índice, rollback), `products.public.test.ts` (`$or` id/slug, 404 unpublished), `products.admin.test.ts` (slug único 400, cuts por tipo, soldOut), `orders.public.test.ts` (cut inválido, soldOut), `complaints.test.ts` (correlativo secuencial y por año, rate limit con `now` inyectado, sin SMTP → `emailSent:false`, mailer mock), `sizes.test.ts` (= `tallas.json`) | `cd api && npm test` |
| Backoffice (vitest + RTL) | `ProductForm.test.tsx` (slug/cortes/agotado, tallas ocultas en polo), `ComplaintList.test.tsx` | `cd backoffice && npm test` |
| Storefront | Solo `tsc && vite build` + checklist manual de §10 (sin test runner, fuera de alcance) | `npm run build` |

## 12. Migración / rollout
Un commit por fase, `git revert` por fase. Datos: fase 4 corre `migrate-devhaus` (aditivo); revertir = `--down`. Persist v3 solo normaliza el carrito (no purga). `Complaint`/`Counter` son colecciones nuevas y pueden quedarse. La fase 2b es independiente de 3–5; la 4 puede adelantarse a la 3.

## 13. Preguntas abiertas (defaults propuestos, no bloqueantes)
- [ ] Polos sin corte mujer bajo `corte=mujer`: mostrar con meta "Solo corte hombre" (default) vs ocultar.
- [ ] "Más vendidos" sin ventas: `likes` desc (default) hasta tener campo manual.
- [ ] Rate limit 5/15 min por IP: ajustar si hay NAT corporativo.
- [ ] Copia del Libro al consumidor: obligatoria por norma; si no hay SMTP se muestra el código en pantalla y se recomienda capturarlo.
