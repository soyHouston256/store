# Exploration: devhaus-rebrand

Rebranding Estilos → devhaus.pe + rediseño de la tienda según `docs/devhaus-handoff/` (HANDOFF.md, specs 01–05, brand/). Backend de artefactos: `none` (este archivo es el artefacto).

## Current State

### Stack (verificado)
- Storefront (raíz): React 18, Vite `^2.9.5`, TS `^4.6.3`, styled-components `^5.3.5`, sass, RTK + redux-persist `^6`, react-router-dom `^6.8.1`, usehooks-ts, framer-motion, react-lottie-player (`package.json`). Scripts: solo `dev`, `build` (`tsc && vite build`), `preview` — sin lint ni test.
- API `api/`: Express + Mongoose 8 + zod + JWT, ESM, vitest (10 archivos `*.test.ts`), `npm test` / `npm run build` (`api/package.json`). Sin nodemailer, sin rate-limit, sin slug lib.
- Backoffice `backoffice/`: React 18 + Vite 5 + vitest/testing-library (8 archivos test), `npm test` / `npm run build`.
- Infra: `docker-compose.yml` (mongo, api, storefront nginx, backoffice nginx, caddy), `Caddyfile` (store./admin./api.$DOMAIN), `nginx.conf` con SPA fallback (deep links `/producto/:slug` funcionarán sin cambios).

### Entrada HTML y assets públicos
- `index.html:2` `lang="en"`; `:5` favicon apunta a `/src/favicon.svg`; `:9` carga solo Inter; `:10` título `estilos.dev: tienda para devs`; `:12-31` un `<style>` está fuera de `<head>` (entre `</head>` y `<body>`) — HTML inválido a corregir al tocar el archivo. Sin meta description, OG, manifest.
- **No existe `public/`** en la raíz (verificado con `ls`). El paquete trae `docs/devhaus-handoff/public/*` (favicon.ico/svg, apple-touch-icon, icon-192/512, logo.svg, logo-dark.svg, og-image.png) listo para copiar.
- `src/favicon.svg`, `src/logo.svg` (logo viejo), `src/assets/images/hero/hero.png` (usado en `Hero.tsx:2` y `Done.tsx:3`; alt "polo personalizado Estilos" en `Hero.tsx:295`).

### Tema y tokens
- `src/Theme.ts:39-118` `GlobalStyles`: variables `--color-*`, `--font-size-*`, `--radius*`, `--screen-desktop: 994px` (`:41`), `--gradient-brand` (`:60`). Light en `:root` (`:40-77`), dark en `.dark-theme` (`:78-94`).
- `src/components/ThemeSwitch.tsx:29-33` alterna `document.body.classList` `dark-theme` con `useDarkMode()` de usehooks-ts (clave localStorage `usehooks-ts-dark-mode`). `brand/tokens.css` usa `[data-theme="dark"]` → hay que mapear a `body.dark-theme`.
- `.sr-only` **sí existe** en `src/App.css:13-23` → `Logo.tsx` del handoff puede usarlo tal cual (corrige el hallazgo previo).
- Todas las secciones fijan ancho con `width: var(--screen-desktop)` + media queries (Hero, Benefits, SearchBox, Products, CategoryFilters, Testimonials, Footer, Navbar). El spec pide contenedor 1152 + padding 64/16: conviene un `Container` compartido y redefinir `--screen-desktop`.

### Rutas y layout (`src/App.tsx:41-63`)
- `/` → `Home` con hijo `/product/:id` → `Product` (modal). `Home.tsx:18` renderiza `<Outlet />`, así que el modal se pinta sobre la home. `location.state.background` (`App.tsx:24-25, 58-62`) es legado: `Card.tsx:142-144` navega a `product/${id}` sin `state`.
- `/cart` (redirige a `/` si carrito vacío), `/done` (requiere `order` en localStorage), `/pedido`, `/pedido/:id` (`Tracking.tsx`).
- `Navbar` global (`App.tsx:43`); `Footer` solo dentro de `Home.tsx:17` → Cart/Tracking no tienen footer hoy.
- `Home.tsx:10-20`: Hero → Benefits → SearchBox → Products → Testimonials → Footer.

### Ocurrencias de la marca vieja (grep `estilos`, case-insensitive)
`index.html:10`, `src/components/Hero.tsx:295`, `src/components/Footer.tsx:146,172`, `src/components/Benefits.tsx:106`, `src/data/orderMessage.ts:48` ("tienda de estilos.dev"). Logo `<Estilos/>` = `src/components/Logo.tsx` (SVG con paths). Backoffice: título "Store Backoffice" (`backoffice/index.html:7`), sin marca.

### Catálogo hoy
- `src/components/Products.tsx:97` `const isLoading = !products.length` y `:103` pinta el conteo siempre → "0 diseños disponibles" + shimmers infinitos si la API falla o devuelve vacío. `src/hooks/useProductsList.ts:8-14` sin try/catch ni estado `loading/error`; `src/data/http.ts:40-54` lanza `ApiError` (hay base para manejarlo).
- Filtros en Redux: `src/store/slices/products/index.ts:4-11` (`term` + `category`), estado en `src/type.d.ts:12-19`. **No se reflejan en la URL.** Chips en `CategoryFilters.tsx:48-53`; búsqueda en `SearchBox.tsx:56-63`.
- `Card.tsx`: badge "Popular" si `likes >= 3` (`:138,145`), `LikeProduct` absoluto arriba-der, visual con `colors[0]` (`:158`), botón `+` que también navega al detalle (`:165-169`). No hay puntos de color ni meta de corte.
- `CardShimmer.tsx` existe (mantener).
- Sin campo de "stack"/tags: `src/data/productLogos.ts:41-45` deriva el logo del nombre (`Polo Docker` → `docker`).
- Sin `createdAt` en el DTO público (`api/src/models/Product.ts:45-57`) aunque el schema tiene `timestamps: true` (`:36`) → "Novedades" necesita exponerlo. No hay contador de ventas → "Más vendidos" solo puede aproximarse (likes o campo manual).

### Detalle de producto hoy (`src/views/Product.tsx`)
- Modal fijo (`:14-45`), lee `useParams().id` y `useProductsById` (`:454-456`).
- Estado local: `color`, `size`, `logoPosition`, `isFlipped`, `quantity` (`:447-452`). Selector de ubicación del logo con iconos (`LogoPositionIcon`, `:395-440`; opciones de `src/data/logoPositions.ts:5-22`); `FlipButton` "Ver frente/espalda" visible solo con posición trasera (`:507-511`). **Preservar.**
- Requeridos por tipo: `src/data/typeConfig.tsx:25-50` (`polo`: colors+sizes+logoPosition+flip; taza/mousepad: solo color).
- Agregar: `productAddToCart` (`:480-485`) despacha `addToCart` con `_id: ID()` aleatorio y hace `navigate(-1)`. En `src/store/slices/products/cart.ts:13` la deduplicación busca por `_id` + color + size → como `_id` es nuevo cada vez, cada "agregar" crea una línea nueva (quirk existente; al añadir `cut` conviene deduplicar por `id+cut+color+size+logoPosition`).
- Cantidad sin tope (`:487-493`); spec pide 1–10.
- Sin URL state, sin breadcrumb, sin relacionados, sin JSON-LD.

### Mockups procedurales
- `src/components/TShirt.tsx`: un solo path de silueta (`:221-223`) + `base.png/filter.png` y `base-back.png/filter-back.png` (`:1-4`), posiciones del logo en `%` (`:146-188`). Un corte mujer necesita path + PNGs (frente/espalda) propios o una transformación del actual. Solo hay siluetas-icono en `specs/data/siluetas.ts` (viewBox 200, sin PNG).
- `Mug.tsx`, `Mousepad.tsx`: SVG puro, sin corte.
- `ProductVisual.tsx:7-8` cadena de imagen: `logo` subido → logo local por nombre → `image` legado.

### Carrito, pedido, WhatsApp, tracking
- Ítem: `ProductCartType` (`src/types/ProductType.ts:21-26`: size, color, logoPosition). Persistencia: `src/store/index.ts:21-34` (`version: 2`, migración v2 purga carrito; `blacklist: ['orders','products']` → `cart` y `likes` persisten).
- `likes.likedList` (`src/store/slices/products/likes.ts`) ya es una lista local de ids marcados, persistida → **sirve como base de "favoritos" locales** (decisión del usuario) sin nuevo storage; el contador de servidor sigue en `POST /api/products/:id/like` (`api/src/routes/products.public.ts:33-68`).
- Pedido: `src/data/OrderService.ts:39-48` envía `size/color/logoPosition`; API `api/src/routes/orders.public.ts:15-32` (zod) y `api/src/models/Order.ts:11-23` (snapshot). Backoffice `backoffice/src/api/types.ts:62-71`.
- Mensaje WhatsApp: `src/data/orderMessage.ts:27-34` (Talla · Color · Posición) y `:48` (marca). `src/data/whatsapp.ts:1` número por `VITE_WHATSAPP_NUMBER` (default hardcodeado). Mensajes prellenados: `Hero.tsx:271` ("personalizar uno polo" — typo), `Footer.tsx:139`.
- `CartOrder.tsx:216-234` copy de negocio hardcodeado: "Delivery gratis por pedido mayor a S/ 70" (`total > 70`) y "Stickers gratis: recibirás 4 stickers" → deben salir de `site.ts`.
- Tracking (`src/views/Tracking.tsx:26`) muestra talla/color/posición por ítem → añadir corte.
- Sonidos/Lottie: `NavbarItems.tsx:70-87,110-121` (added.wav + like.json), `LikeButton.tsx:46-52` (like.mp3 + bounce.json), `ThemeSwitch.tsx:22-27` (click.mp3). **Preservar.**

### Reseñas y beneficios
- `src/data/testimonials.ts:14-57` 6 reseñas inventadas (Renzo, Alejandra, Diego, Mariana, Jorge, Fiorella) usadas por `Testimonials.tsx:3,141`; ancla `#resenas` enlazada desde `Footer.tsx:159`. Eliminar; no hay backend de reviews.
- `Benefits.tsx:73-102` copy inventado ("Calidad premium", "Tela suave") → sustituir por barra de confianza con placeholders (spec 02 §5).

### API — modelo y rutas
- `api/src/models/Product.ts:22-37`: `_id: String`, `name`, `price`, `type` enum, `image`, `logo`, `colors: string[]`, `sizes: string[]`, `logoPositions`, `likes`, `published`, timestamps. DTO `:45-73`.
- Admin `api/src/routes/products.admin.ts:17-32` zod `ProductWriteSchema` (colors hex regex ≤12, sizes ≤8 de ≤4 chars); `PUT` reemplazo total con `$set` (`:82-104`); `POST` (`:60-78`). Todo campo nuevo debe entrar en zod + POST + PUT + DTO.
- Público `products.public.ts:13` lista `published` ordenada por nombre; `:22` `findOne({_id})` → lookup por slug requiere `$or` o ruta nueva.
- Seed `api/src/scripts/seed-products.ts:56-67` `$setOnInsert` → docs existentes no reciben campos nuevos. `products.json`: 23 ítems, 19 sin `type` (→ polo), 2 taza, 2 mousepad; 1 con typo `liks` (Polo Node.js), 1 precio string; tallas mayormente `S,M,L`; colores `#FFF/#000` (hex de 3). Nombres = marcas (Redis, Firebase, Docker…): se mantienen por decisión.
- `api/src/config.ts:18` env requeridas (MONGO_URI, JWT_SECRET, ADMIN_USER, ADMIN_PASSWORD_HASH); `docker-compose.yml` pasa env a `api` → SMTP_* deben añadirse ahí y a `.env.example`.
- `api/src/app.ts:34-38` monta routers; `errorHandler.ts` con envelope `{error:{code,message,details}}` y códigos fijos (`:3-9`) — un 429 requiere nuevo código `RATE_LIMITED`.

### Backoffice
- `backoffice/src/pages/ProductForm.tsx:183-256` campos: nombre, precio, tipo, ubicaciones logo, colores (TagInput hex), tallas (TagInput); `ProductForm.test.tsx` existe. `ProductList.tsx:60-68` columnas Logo/Nombre/Tipo/Precio/Likes/Publicado.
- `backoffice/src/App.tsx:11-21` rutas: `/`, `/products/new`, `/products/:id`, `/orders`, `/orders/:id` → añadir `/complaints`.
- `backoffice/src/api/client.ts` funciones por recurso; `types.ts:14-37` DTOs a extender.

## Spec → código (mapa de impacto)

| Spec | Requisito | Toca |
|---|---|---|
| 01 | Strings/título/meta/OG/favicons/manifest | `index.html`, nuevo `public/`, `Hero.tsx:295`, `Footer.tsx:146,172`, `Benefits.tsx:106`, `orderMessage.ts:48`, `src/favicon.svg`, `src/logo.svg` |
| 01 | Fuentes Bricolage/DM Sans/JetBrains Mono | `index.html:7-9,13-15`, `src/index.css:1-8`, `Theme.ts` |
| 01 | `DevhausLogo` | reemplaza `src/components/Logo.tsx`; usado en `Navbar.tsx:31`, `Footer.tsx:147` |
| 01 | Tokens `--dh-*` + dark | `Theme.ts:40-94` |
| 01 | Barra de anuncio + header (nav Polos/Mousepads/Tazas/Personaliza/Ayuda, buscar, favoritos, tema, `Carrito · N`) | `Navbar.tsx`, `NavbarItems.tsx`, `App.tsx:43`, nueva `AnnouncementBar` |
| 01 | Footer 4 columnas + legal + RUC | `Footer.tsx`; mover `Footer` a `App.tsx` (hoy solo en Home) |
| 01 | Libro de Reclamaciones | nuevo: `api/src/models/Complaint.ts`, `api/src/routes/complaints.public.ts`, `complaints.admin.ts`, mailer, `src/views/LibroReclamaciones.tsx`, `backoffice/src/pages/ComplaintList.tsx` |
| 02 | Hero (mono line, h1 sin degradado, CTAs, etiqueta) | `Hero.tsx` |
| 02 | Tiles de categoría con conteo real | nuevo `CategoryTiles.tsx`, cuenta desde `state.products.products` |
| 02 | Catálogo: orden + chips + segmented corte + dropdowns Stack/Color/Talla, filtros en URL | `Products.tsx`, `CategoryFilters.tsx`, `SearchBox.tsx`, slice `products/index.ts`, `type.d.ts`; `useSearchParams` |
| 02 | Tarjeta (imagen 300, badge, favorito 44, puntos color, meta corte, precio, `+`) | `Card.tsx`, `LikeProduct/LikeButton` |
| 02 | Skeleton solo mientras carga / conteo solo con data | `Products.tsx:97-103`, `useProductsList.ts` |
| 02 | Bloque personalización, barra de confianza, FAQ | `Benefits.tsx` → `TrustBar.tsx`; nuevos `Customize.tsx`, `Faq.tsx` |
| 02 | Reseñas solo reales | borrar `testimonials.ts`; `Testimonials.tsx` renderiza solo con datos (sin backend v1 → no se muestra) |
| 03 | `/producto/:slug` página completa (galería, compra, acordeón, relacionados, sticky móvil, JSON-LD, URL state) | nueva `src/views/ProductPage.tsx`; `App.tsx` rutas; `Card.tsx` navegación; redirección `/product/:id` |
| 03 | Cantidad 1–10, "Agregado ✓ · Ir al carrito" | `Product` lógica `:480-493`, `cart.ts` |
| 03 | Tallas agotadas tachadas | decisión: solo `soldOut` por producto (sin stock por variante) → botón "Agotado" deshabilitado |
| 04 | Corte hombre/mujer (polo) | `api Product.ts` (`cuts`), zod, DTO, seed, migración; `ProductType.ts`; `typeConfig.tsx`; `TShirt.tsx` (arte mujer); `Card.tsx`; filtros; `ProductCartType`; `cart.ts`; `OrderService.ts`; `orders.public.ts`; `Order.ts`; `orderMessage.ts`; `Tracking.tsx`; backoffice `ProductForm`, `types.ts`, `OrderDetail` |
| 04 | Tallas por corte (`tallas.json`) | nuevo módulo compartido de tallas (storefront `src/data/sizes.ts`, api `src/models/sizes.ts`, backoffice) |
| 05 | Placeholders centralizados | nuevo `src/config/site.ts` |

## Placeholders a centralizar en `src/config/site.ts`

Extraídos de `specs/*.md` y `reference/canvas/*.dc.html` (grep de `[...]`), más copy de negocio ya hardcodeado en el código. Todos con `TODO`, valor `null`/vacío y **ocultando el fragmento** que dependa de ellos hasta que se completen.

| Clave propuesta | Placeholder original | Dónde se usa |
|---|---|---|
| `legal.businessName` | `[RAZÓN SOCIAL]` | footer, libro de reclamaciones |
| `legal.ruc` | `RUC [NÚMERO]` | footer |
| `legal.termsText`, `legal.privacyText` | textos T&C / privacidad | páginas legales |
| `complaints.email` | correo destino | mailer API (`COMPLAINTS_EMAIL` env) |
| `complaints.serialFormat` | formato correlativo | API (`LR-YYYY-000001` por defecto, editable) |
| `contact.whatsapp` | número | ya `VITE_WHATSAPP_NUMBER` (`whatsapp.ts:1`) — quitar default hardcodeado |
| `contact.hours` | `[HORARIO]` | FAQ |
| `social.instagram`, `social.tiktok`, `social.other[]` | `[REDES]` | footer |
| `shipping.courier` | `[NOMBRE]` courier | trust bar, FAQ |
| `shipping.hasTracking` | `[SÍ/NO]` | FAQ |
| `shipping.limaDays`, `shipping.provinceDays` | `Lima [N] días · Provincias [N]` | personalización, ficha, FAQ |
| `shipping.freeFrom` | `[S/ MONTO]` | announcement bar; hoy `total > 70` en `CartOrder.tsx:216` |
| `payments.gateway` | `[PASARELA]` | trust bar, FAQ; **no mostrar "tarjeta" ni "Envío se calcula al pagar" mientras sea null** |
| `payments.yapePlinIntegrated` | manual/integrado | FAQ |
| `product.material`, `product.grammage`, `product.prewashed`, `product.printTechnique` | `[MATERIAL] [GRAMAJE] [TÉCNICA]` | trust bar, ficha (meta, acordeón) |
| `sizes.hombre[]`, `sizes.mujer[]` con `anchoPechoCm/largoCm` | `tallas.json` (medidas `null`) | guía de tallas (tabla solo si hay medidas) |
| `product.mousepadSize`, `product.mugMl` | `[MEDIDAS]`, `[ML]` | meta de tarjeta/ficha |
| `product.showSku` | `SKU [CÓDIGO]` | ficha (oculto hasta tener códigos) |
| `product.modelHeightCm`, `product.modelSize` | `Modelo mide [CM] y usa talla [T]` | galería (solo con foto) |
| `customization.fromPrice` (15) y `customization.priceIsSurcharge` | "Desde S/ 15" (aclarar copy) | hero, tiles, bloque personalización, footer |
| `customization.mockupHours` | `[N] horas` | personalización |
| `returns.days`, `returns.conditions` | `Cambios en [N] días` | trust bar, ficha, FAQ |
| `promos.freeStickers` | "4 stickers gratis" (`CartOrder.tsx:224-231`) | carrito |
| `reviews.source` | fuente de reseñas | sección oculta |
| `[N] diseños`, `[N] reseñas`, `[PROMEDIO]` | **no son config**: se calculan de datos |

## Affected Areas (resumen)
- `index.html`, nuevo `public/`, `src/Theme.ts`, `src/index.css`, `src/App.css`, `src/App.tsx`, `src/main.tsx`
- `src/components/{Logo,Navbar,NavbarItems,Footer,Hero,Benefits,Testimonials,Products,Card,CategoryFilters,SearchBox,CardShimmer,TShirt,ProductVisual,LikeButton,LikeProduct,CartOrder,ProductCart}.tsx`
- `src/views/{Home,Product,Cart,Tracking}.tsx` + nuevas vistas (ProductPage, Ayuda/FAQ, Guía de tallas, Envíos, Cambios, Términos, Privacidad, LibroReclamaciones, Favoritos opcional)
- `src/data/{typeConfig,logoPositions,orderMessage,whatsapp,OrderService,ProductService,testimonials,colorNames}.ts(x)`, nuevo `src/config/site.ts`, `src/data/sizes.ts`, `src/data/slug.ts`
- `src/store/index.ts` (persist v3), `slices/products/{index,cart,likes}.ts`, `src/type.d.ts`, `src/types/ProductType.ts`
- `api/src/models/{Product,Order}.ts`, nuevos `Complaint.ts`, `Counter.ts`; `routes/{products.public,products.admin,orders.public}.ts`, nuevos `complaints.public.ts`, `complaints.admin.ts`; `middleware/{errorHandler,rateLimit}.ts`; `mail/mailer.ts`; `config.ts`; `scripts/{seed-products,migrate-devhaus}.ts`; tests
- `backoffice/src/{App.tsx,api/{client,types}.ts,pages/{ProductForm,ProductList,OrderDetail}.tsx}`, nueva `pages/ComplaintList.tsx`; tests
- `docker-compose.yml`, `.env.example` (SMTP/complaints env), `products.json` (opcional: `slug`/`cuts` para seeds nuevos)

## Approaches

### A. Tokens y tema
1. **Alias `--dh-*` dentro de `GlobalStyles` y re-apuntar `--color-*` a la paleta devhaus** — `:root` y `.dark-theme` en `Theme.ts`; componentes viejos heredan la marca sin tocarlos; los nuevos usan `--dh-*`.
   - Pros: cambio mínimo, dark mode intacto, sin CSS extra. Cons: dos familias de variables conviven un tiempo. Effort: Low.
2. Importar `tokens.css` tal cual y reescribir `[data-theme]` → `.dark-theme` en un `.css` aparte.
   - Pros: fidelidad al paquete. Cons: paleta vieja sigue viva en `--color-*`; dos fuentes de verdad. Effort: Low-Med.

### B. Página de producto
1. **Ruta completa `/producto/:slug` reemplaza el modal; `/product/:id` resuelve por id y redirige** (`GET /api/products/:idOrSlug` con `$or`).
   - Pros: cumple spec 03 (breadcrumb, galería, relacionados, JSON-LD, sticky), URLs compartibles. Cons: se pierde el modal sobre la home (aceptado por decisión). Effort: High.
2. Mantener modal + añadir página. Cons: dos UIs para lo mismo. Effort: High+.

### C. Tallas por corte
1. **Tabla global por corte** (`tallas.json` en módulo compartido) y `cuts: Cut[]` por producto; `sizes` por producto queda como legado/ignorado para polos. Pros: decisión ya tomada; simple. Cons: `sizes` en backoffice pierde sentido para polos (ocultar). Effort: Med.
2. Tallas por producto y por corte (`sizesByCut`). Cons: más UI y datos. Effort: High.

### D. Migración de datos
1. **Script idempotente `migrate-devhaus.ts`** (`updateMany` para `cuts: ['hombre']` en polos sin `cuts`, `soldOut:false`, `slug` único generado de `name`) + índice único `slug` creado después. Defaults del schema cubren lecturas intermedias. Effort: Low-Med.
2. Solo defaults en schema. Cons: `slug` único no puede ser default. Rechazado.

### E. Libro de Reclamaciones
1. **Modelo `Complaint` + `Counter` (correlativo atómico) + `POST /api/complaints` (zod, rate limit in-memory por IP) + `nodemailer` opcional (si falta `SMTP_*` se registra y se guarda igual) + `GET /api/admin/complaints`.** Effort: Med.
2. Solo email sin persistencia. Rechazado (Indecopi exige registro y número).

### F. Favoritos
1. **Reutilizar `likes.likedList` persistido** como favoritos (botón corazón = like local + contador servidor). Añadir contador en header y vista `/favoritos` opcional. Effort: Low.
2. Slice nuevo `favorites`. Cons: duplica estado. Effort: Low-Med.

## Recommendation
A1 + B1 + C1 + D1 + E1 + F1, en 6 fases (ver proposal). Orden: fundación de marca → header/footer/legales → Libro → home/catálogo (sin corte, con URL state y fix de carga) → modelo de datos (cut/slug/soldOut de punta a punta) → ficha de producto.

## Risks
- **Arte del corte mujer**: `TShirt.tsx` depende de PNG base/filter + path; sin arte real la opción es derivar (transform del path actual + mismos PNG) con calidad limitada. Bloquea la parte visual de spec 04 en fase 5, no el resto.
- **Vite 2 / TS 4.6**: nuevas librerías (p. ej. slug o helmet) pueden requerir versiones viejas; preferir implementaciones propias (slugify simple, JSON-LD por `useEffect`).
- **Fuentes Google**: 3 familias suman peso; usar `display=swap` y solo pesos necesarios.
- **`$setOnInsert` en seed**: cualquier campo nuevo exige migración; olvidarla deja `slug` vacío → rutas rotas. Mitigar con migración en `api` + test.
- **Índice único `slug`**: colisiones (dos "Polo React") → sufijo `-2`; probar en migración.
- **Cart persistido**: ítems viejos sin `cut` → migración v3 que normaliza (`cut: 'hombre'` en polos) o purga.
- **Copy de pagos**: prohibido mostrar "tarjeta"/"Envío se calcula al pagar" sin pasarela → fragmentos condicionados a `payments.gateway`.
- **Rate limit in-memory** no comparte estado entre réplicas (hay una sola instancia en compose; aceptable).
- **Sin tests en storefront**: la verificación es `npm run build` + revisión manual; considerar añadir vitest al storefront más adelante (fuera de alcance).
- **Layout global** (`--screen-desktop: 994px` en todas las secciones): pasar a contenedor 1152 afecta Cart/Tracking; hacerlo vía variable + `Container` para no romper páginas no rediseñadas.

## Open Questions (no bloqueantes; se proponen defaults)
1. Productos sin corte mujer en el filtro "Mujer": default propuesto = mostrarlos con etiqueta "Solo corte hombre" (configurable), en lugar de ocultarlos.
2. "Más vendidos" sin datos de ventas: default = ordenar por `likes` desc; "Novedades" = `createdAt` desc (exponer en DTO).
3. Color en URL (`?color=negro`): default = slug del nombre más cercano (`colorNames.ts`) con fallback al hex sin `#`.

## Ready for Proposal
Sí. Las decisiones de negocio están cerradas; el usuario debe aportar el arte del corte mujer y los datos de spec 05 (pueden llegar durante las fases; el código se diseña para ocultar lo que falte).
