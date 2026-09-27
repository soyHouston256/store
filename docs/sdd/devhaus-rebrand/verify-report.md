# Verify report: devhaus-rebrand

Fecha: 2026-09-27 · Backend de artefactos: `none` (este archivo es el artefacto) · Baseline: `9b8d608` · Fases 1–5 en commits `2c8aad0`, `9ffc8d2`, `6bff886`, `f722608`, `589a84f`; fase 2b **sin commit** (working tree). Fuente de verdad donde spec/design difieren: sección "Conciliación" de `tasks.md` (C1–C17).

## Veredicto: **PASS WITH FINDINGS** (PASS CON HALLAZGOS)

Los 40 requisitos de `spec.md` están implementados (39 satisfechos, 1 parcial por dependencia externa: arte del corte mujer, T4.16). 55/56 tareas hechas (la restante es la externa). Build raíz, 310 tests api y 64 tests backoffice en verde con la salida real de esta corrida. Smoke en vivo sobre el stack Docker (curl + headless Chrome) sin fallos. Sin hallazgos críticos; los hallazgos son de severidad media/baja (fase 2b pendiente de commit, rate limit que cuenta 400s, limpieza de CSS/dead code, a11y menor, drift leve del README).

---

## 1. Cobertura por fase

| Fase | Requisitos satisfechos / total | Tareas hechas / total | Notas |
|---|---|---|---|
| 0 (transversal) | 3/3 | — | R0.2 verificado por código + DOM en vivo; escenarios con interacción (sonidos, flip real) no automatizables |
| 1 Fundación | 7/7 | 8/8 | `grep estilos` vacío; `dist/` con favicon/og/manifest |
| 2 Shell | 5/5 | 7/7 | Footer global en todas las rutas (verificado en `/favoritos`) |
| 2b Libro | 5/5 | 9/9 | **Sin commit**; nombres según C4–C7 (`code`, `docType/docNumber`, `claim.*`, `?limit&cursor`) |
| 3 Home+catálogo | 7/7 | 8/8 | Deep links y normalización verificados en vivo |
| 4 Modelo de datos | 5/6 + 1 parcial | 16/17 (T4.16 externa) | R4.6 parcial: `TSHIRT_ART.mujer` es placeholder (`isPlaceholder: true`) hasta recibir arte |
| 5 Ficha | 7/7 | 7/7 | JSON-LD, redirección legada, deep link de selección verificados en vivo |
| **Total** | **39 ✓ + 1 parcial / 40** | **55/56** | |

---

## 2. Automatizados (salida real de esta corrida)

| Comando | Resultado |
|---|---|
| raíz `npm run build` (tsc 4.6 + vite 2) | **EXIT=0**. 545 módulos. Avisos preexistentes: chunk > 500 KiB y `*display: inline` en `src/assets/reset.css:91` (hack IE, no nuestro) |
| `cd api && npm test` | **14 files / 310 tests passed**, EXIT=0 (esperado 310 ✓) |
| `cd api && npm run build` | EXIT=0 |
| `cd backoffice && npm test` | **11 files / 64 tests passed**, EXIT=0 (esperado 64 ✓) |
| `cd backoffice && npm run build` | EXIT=0 (54 módulos) |
| `grep -rniE "estilos(\.dev)?" src index.html` (R0.3) | vacío ✓ |

Archivos de test del cambio: `api/src/routes/complaints.test.ts` (38), `products.admin.test.ts` (+12 fase 4), `products.public.test.ts` (+7), `orders.public.test.ts` (+6), `scripts/migrate-devhaus.test.ts` (6), `seed-products.test.ts` (7), `models/slug.test.ts` (8), `models/sizes.test.ts` (2), `config.test.ts` (+3); backoffice `ProductForm.test.tsx` (15), `ComplaintList.test.tsx` (6), `ComplaintDetail.test.tsx` (4), `api/slug.test.ts` (2). El storefront no tiene test runner (fuera de alcance por proposal): se verifica por build + DOM en vivo + lectura de código.

---

## 3. Smoke en vivo (Docker: api/storefront/backoffice reconstruidos 08:26–08:27, posteriores al último mtime de `src/` 08:25:50)

### 3.1 curl

| URL | Esperado | Real |
|---|---|---|
| `http://store.localhost/` | 200 | 200 |
| `http://store.localhost/producto/polo-docker` | 200 | 200 |
| `http://store.localhost/libro-de-reclamaciones` | 200 | 200 |
| `http://store.localhost/favoritos` | 200 | 200 |
| `http://store.localhost/ayuda` | 200 | 200 |
| `GET http://api.localhost/api/products` | 200, 23 ítems con `slug/cuts/soldOut/createdAt` | 200, **23** ítems, 0 sin campos, 23 slugs únicos, tipos {polo 19, taza 2, mousepad 2}, ningún `createdAt` epoch, ningún `soldOut` |
| `GET /api/products/redis` vs `/api/products/0utzWxB9wGfCW1G7P9JI` | idéntico | **IDENTICAL** (`diff` vacío) |
| `GET /api/products/nope` | 404 | 404 `{"error":{"code":"NOT_FOUND","message":"Product not found"}}` |
| `GET /api/admin/complaints` sin token | 401 | 401 `{"error":{"code":"UNAUTHORIZED",…}}` |
| `http://admin.localhost/` · `/complaints` | 200 | 200 · 200 |
| `GET /api/products/polo-docker` | — | `id suksulRQ9ZILTdxyNKt2`, `cuts ['hombre']`, `soldOut false`, `sizes` legado `['XS','S','M','L','XL']` (ignorado: la UI usa la tabla S–XXL) |

Mongo (solo lectura): `store.complaints` = 4 docs `LR-2026-000001…000004`; `counters` = `{_id:'complaints-2026', seq:4}`; índice `slug_1` `{unique:true, partialFilterExpression:{slug:{$type:'string'}}}` presente.

### 3.2 Headless Chrome (`--headless=new --disable-gpu --dump-dom --virtual-time-budget=6000`, fuentes de Google bloqueadas por `--host-resolver-rules`; Chrome no termina solo tras el dump → se mató con `pkill`, 0 procesos restantes)

| Ruta | Comprobación | Resultado |
|---|---|---|
| `/` | header nav 5 enlaces | ✓ `Polos /?cat=polo#catalogo`, `Mousepads`, `Tazas`, `Personaliza /#personaliza`, `Ayuda /ayuda` |
| `/` | announcement bar | ✓ `Envío a todo el Perú · Paga con Yape, Plin` (sin "Gratis desde", sin "tarjeta") |
| `/` | CutSegmented | ✓ `role="group" aria-label="Corte"`, Hombre `aria-pressed=true` |
| `/` | tarjetas con link a slug | ✓ 23 hrefs `/producto/{slug}` |
| `/` | sin "0 diseños", sin reseñas | ✓ `23 diseños disponibles`; sin `rese[nñ]as|Testimon` |
| `/` | tiles / hero tag / trust bar | ✓ `Hombre y mujer · 19 diseños →`, `2 diseños →` ×2, `Desde S/ 15 →`; `Polos S/ 60 · Personaliza desde S/ 15`; trust = `Envío a todo el Perú`, `Yape, Plin o transferencia`, `Hecho en Perú`, `Personaliza desde S/ 15` |
| `/` | badges top-3 / Nuevo; placeholders | ✓ 3× `Más vendido`, resto `Nuevo`; 0 `[MAYÚSCULAS]`, 0 `null` en DOM; footer `© 2026 devhaus.pe. Precios en soles (S/), IGV incluido.`; sin Términos/RUC/WhatsApp (TODO) |
| `/?cat=taza&orden=precio` | solo tazas, orden asc | ✓ `Taza Docker`, `Taza React` (35, 35), chip `Tazas` activo, `<select id="orden">` con `precio`, `2 de 23 diseños`; CutSegmented y Talla ocultos |
| `/?cat=zapato` | normaliza | ✓ chip `Todos`, `23 diseños disponibles` |
| `/?cat=polo&corte=mujer` | corte mujer | ✓ Mujer `aria-pressed=true`, 19× `Solo corte hombre`, 19× `data-cut="mujer" data-placeholder="true"` |
| `/producto/polo-docker` | ficha | ✓ `<title>Polo Docker — devhaus.pe</title>`; breadcrumb `Inicio / Polos / Polo Docker`; `Corte: Hombre — corte recto` (1 cut → etiqueta fija); tallas `S M L XL XXL`; posiciones `Bolsillo delantero / Pecho / Espalda / Bolsillo + espalda` (Pecho activo, sin botón flip); thumbs `Frente/Espalda`; CTA `Agregar al carrito · S/ 80.00` (×2: principal + sticky); nota `IGV incluido` (sin "Envío se calcula al pagar"); sin CTA WhatsApp (TODO); `Guía de tallas`; acordeón Descripción abierta; caja entrega `Yape · Plin · Transferencia`; `Completa el setup` |
| `/producto/polo-docker` | JSON-LD | ✓ `{"@type":"Product","name":"Polo Docker","image":[…docker….svg],"brand":{…"devhaus.pe"},"offers":{"price":"80.00","priceCurrency":"PEN","availability":"https://schema.org/InStock","url":"http://store.localhost/producto/polo-docker"}}` |
| `/producto/polo-docker?corte=mujer&color=negro&talla=M&logo=back` | deep link | ✓ Color `Negro`, Talla `M`, Posición `Espalda`, botón `Ver frente` visible, miniatura `Espalda` activa; `corte=mujer` cae a `hombre` (el producto solo tiene hombre, `data-cut="hombre"`) |
| `/product/0utzWxB9wGfCW1G7P9JI` | redirección legada | ✓ DOM = ficha **Redis** (`<title>Redis — devhaus.pe</title>`, JSON-LD `url …/producto/redis`) |
| `/producto/no-such-slug` | 404 | ✓ `No encontramos ese producto` + link `/#catalogo` |
| `/libro-de-reclamaciones` | formulario | ✓ título, 4 `<legend>` (consumidor / bien / detalle / declaración), 11 `<label for="lr-*">` (name, docType, docNumber, email, phone, address, description, amount, orderId, detail, request), radios `kind`/`type`, checkboxes `isMinor`/`acceptsTerms`, botón `Enviar hoja de reclamación`; sin RUC ni plazo (TODO); texto Ley 29571 |
| `/ayuda` | acordeón | ✓ un solo `aria-expanded="true"` (primer ítem); envío `Enviamos a todo el Perú.` sin Provincias; sin "tarjeta" |
| `/favoritos` | vacío + shell | ✓ `Tus favoritos — devhaus.pe`, mensaje vacío, announcement + footer global |

No se enviaron reclamaciones (rate limit / datos). No verificable en vivo con la data actual: selector de 2 cortes + reset de talla, badge/botón "Agotado" (ningún producto `soldOut`, todos `cuts:['hombre']`), sonidos/Lottie, "Agregado ✓" 3 s, menú móvil (requieren interacción) — cubiertos por lectura de código (§4).

---

## 4. Cobertura de requisitos (evidencia `path:line`)

Leyenda: ✓ satisfecho · ◐ parcial · T = test automatizado en verde · L = verificado en vivo (DOM/curl) · C = verificado por lectura de código.

### Fase 0 — transversal
| Req | Estado | Evidencia |
|---|---|---|
| R0.1 config centralizada | ✓ C/L | `src/config/site.ts:100-166` (todo `null/[]` + `// TODO(spec-05)`), `has()`/`get()`/`isConfigured()` `:197-233`; announcement L (`Envío a todo el Perú · Paga con Yape, Plin`); trust bar 4 fallbacks L; `CartOrder.tsx:157,226,239` oculta delivery gratis y stickers |
| R0.2 funciones preservadas | ✓ C/L | ver §5 |
| R0.3 verificación de cierre | ✓ T | §2 |

### Fase 1
| Req | Estado | Evidencia |
|---|---|---|
| R1.1 `site.ts` tipado + `has` | ✓ C | `site.ts:24-95` (`SiteConfig`), `SiteKey = Paths<SiteConfig>` `:188`, `has` `:194`; C9: `isConfigured`+`get` `:205-233`; `complaints.responseDays` `:38-41` |
| R1.2 public/, HTML, meta | ✓ C/L | `public/` 8 archivos + `site.webmanifest` (C10) + `robots.txt`; `index.html:2` `lang="es"`, `:6` título C10, `:7` description, `:12,15,19` OG/Twitter, `:33` Google Fonts `display=swap`, `<style>` `:35-58` dentro de `<head>`; `dist/index.html` `</style>` L58 < `</head>` L61; `src/favicon.svg`, `src/logo.svg`, `testimonials.ts`, `Testimonials.tsx`, `StarRating.tsx` borrados (diff stat) |
| R1.3 tokens y tema | ✓ C/L | `Theme.ts:33-104` `--dh-*` en `:root`, `:105-119` `.dark-theme` con `colorMapping` repetido, `:81` `--screen-desktop: min(1152px, …)` (C14), `:29` `--gradient-brand: var(--dh-accent)`; DOM en vivo `<body class="dark-theme">` renderiza |
| R1.4 `DevhausLogo` | ✓ C/L | `Logo.tsx:123-168` props `markSize/showChip/variant`, `auto` vía `MutationObserver` `:23-33`, `.sr-only` `:165`; `Header.tsx:76`, `Footer.tsx:183` |
| R1.5 strings de marca | ✓ L | `grep estilos` vacío; `orderMessage.ts:52` "devhaus.pe"; `Hero.tsx:205` "personalizar un polo" |
| R1.6 WhatsApp sin default | ✓ C/L | `whatsapp.ts:7-17` (`null`, C12); CTAs ocultos: `Hero.tsx:224`, `Footer.tsx:186`, `Customize.tsx:159`, `ProductPage.tsx:438`, `pages.tsx:87,215`; `CartOrder.tsx:187-188` navega a `/done` sin número; DOM en vivo sin "whatsapp" |
| R1.7 reseñas eliminadas | ✓ L | DOM sin reseñas; `Home.tsx:20-31` |

### Fase 2
| Req | Estado | Evidencia |
|---|---|---|
| R2.1 announcement bar | ✓ C/L | `AnnouncementBar.tsx:32-37` fragmentos condicionales; `:9-11` 40px tinta/crema; L |
| R2.2 header | ✓ C/L | `Header.tsx:70-84` (84px, `markSize` 40/32, `showChip={!isTablet}`, nav oculto ≤1024 `:64-66`), `navLinks.ts:10-16`; `NavbarItems.tsx:189-215` Sigue tu pedido · buscar 44 · favoritos 44 con `likedList.length` · ThemeSwitch · pill `Carrito · N`; `MobileMenu.tsx:115` click fuera, `:121-128` Escape, `:154-166` 5 enlaces + Sigue tu pedido; `Favorites.tsx:86` filtra por `likedList` |
| R2.3 footer global | ✓ C/L | `Layout.tsx:41-51` en `App.tsx:35`; `Footer.tsx:169-173` línea RUC condicional, `:209-210` Términos/Privacidad condicionales, `:216` ©, `:217-226` redes condicionales; L en `/favoritos` |
| R2.4 páginas estáticas | ✓ C/L | `content/pages.tsx:31-37` (Lima/Provincias condicionales), `:46-55` pagos sin tarjeta, `:106-135` tabla solo con cm completos + "Medidas en cm pendientes de confirmación.", `:224-236` legales → "Contenido en preparación"; `Accordion.tsx:75-79,93` exclusivo/primero abierto/`aria-expanded`; rutas `App.tsx:53-55`; L `/ayuda` |
| R2.5 `Container` | ✓ C | `Container.tsx:13-21`; `Theme.ts:134,145` (`--dh-page-x` 64/32/16); usado en Hero, Products, CategoryFilters, Footer, SearchBox, Cart (`views/Cart.tsx:9`), Tracking (`:45`), Done |

### Fase 2b (C4–C7 aplicadas)
| Req | Estado | Evidencia |
|---|---|---|
| R2b.1 `Complaint`/`Counter` | ✓ T | `api/src/models/Complaint.ts:50-65` (`code` único, `consumer.{docType,docNumber,…}`, `item`, `claim`, `status`, `emailSent`, `ip`), `:73-75` `formatCode` → `LR-2026-000001`; `Counter.ts:19-26` `findOneAndUpdate $inc upsert`; tests `complaints.test.ts:46,54,66` |
| R2b.2 `POST /api/complaints` | ✓ T/L | `complaints.public.ts:37-92` zod (mensajes ES, `acceptsTerms: z.literal(true)`, `superRefine` isMinor), `:104-150` limiter → validate → `nextSequence` → create → correo best-effort → 201 `{id, code, createdAt, emailSent}`; `rateLimit.ts:29-62` (`Retry-After`, `HttpError('RATE_LIMITED')`), `COMPLAINTS_WINDOW_MS` 60 min `:19`, `max: config.complaints.rateLimit` `:106`; `errorHandler.ts:20` `RATE_LIMITED: 429`; `mailer.ts:53-67` (C6: host **y** email, warn exacto `complaints: SMTP not configured`), `:75-91` nunca lanza; `config.ts:58-66,80-92` opcionales; `.env.example:64-86`; `docker-compose.yml:44-54`; `app.ts:24` `trust proxy`. Tests `:213,230,237,267,285,291,322,335,350`; `config.test.ts:35,48,71` |
| R2b.3 admin | ✓ T/L | `complaints.admin.ts:17` JWT, `:25-34` `?status&limit(1–200, def 50)&cursor(ISO)`, `:63` orden `createdAt:-1`, `:69-93` `GET /:id` 404 y `PATCH /:id/status`; curl sin token → 401; tests `:398,412,427,442,462,478` |
| R2b.4 página storefront | ✓ C/L | `LibroReclamaciones.tsx:107-135` validación C4, `:538-541` prefill `?pedido=`, `:583-616` 400→campos (`API_FIELD_TO_FORM` `:74-91`), 429→"Demasiados envíos, intenta más tarde.", red→genérico conservando datos; `:636-658` razón social/RUC/plazo condicionales; `:661-681` éxito "Tu hoja de reclamación es" + copiar (sin `alert`); `App.tsx:52`; DOM L |
| R2b.5 backoffice `/complaints` | ✓ T | `backoffice/src/App.tsx:21-22`, `RequireAuth.tsx:29` enlace, `ComplaintList.tsx:96-105` columnas Código/Fecha/Tipo/Consumidor/Bien/Pedido/Email enviado/Estado, `:90` "Sin reclamaciones", `:135-141` "Cargar más" con cursor (C7: sin fila expandible → detalle), `ComplaintDetail.tsx:178-188` "Marcar atendido"; tests `ComplaintList.test.tsx:32,76,82,94,103,128`, `ComplaintDetail.test.tsx:31,50,68,86` |

### Fase 3
| Req | Estado | Evidencia |
|---|---|---|
| R3.1 carga/errores | ✓ C/L | `useProductsList.ts:41-54` (`productsLoading/addAllProducts/productsFailed`, `reloadToken`), `Products.tsx:144-206` shimmers solo `loading`, `role="alert"` + "Reintentar", "Aún no hay diseños.", conteo solo con data; L sin "0 diseños" |
| R3.2 DTO `createdAt` | ✓ T/L | `api/src/models/Product.ts:106-108,122`; test `products.public.test.ts:47,62`; L 23/23 con ISO |
| R3.3 hero | ✓ C/L | `Hero.tsx:219-236` mono, h1 `.accent`, `fromPrice`, CTAs (`#catalogo`), etiqueta `Polos S/ {min} · Personaliza desde S/ 15` solo con data `:212`; L |
| R3.4 tiles | ✓ C/L | `CategoryTiles.tsx:90-108` conteo real, sin conteo mientras carga, `?cat=…#catalogo`; L 19/2/2 |
| R3.5 filtros/orden/URL | ✓ C/L | `catalogFilters.ts:193-244` (`parseCatalogParams`: inválidos ignorados, `changed` → `replace`), `useCatalogUrlSync.ts:26-33` URL→Redux, `:50-57` `setParam` `replace:false`; `slice/products/index.ts:19-43` `vendidos/novedades/precio`; `SearchBox.tsx:88-95` debounce 250 ms → `q`; `CategoryFilters.tsx:31-40` scroll horizontal ≤640; L deep link taza+precio y zapato |
| R3.6 tarjeta | ✓ C/L | `Card.tsx:214-215` badge Agotado > Más vendido (top 3, `selectBestSellerIds` `slice:97-105`, C13) > Nuevo (<30 d `:206-211`); `:268-279` `quickAdd` `{size M‖primera, color mostrado, logoPosition chest, quantity 1}` sin navegar; puntos máx. 6 `:292-295`; meta `productMeta` `:229-238`; L 3× Más vendido |
| R3.7 Customize/TrustBar/Faq | ✓ C/L | `Customize.tsx:128-146,152-160`; `TrustBar.tsx:64-96` (4 fallbacks exactos L); `Faq.tsx:53-64` reutiliza `Accordion`+`faqItems`; `Home.tsx:22-29` orden |

### Fase 4
| Req | Estado | Evidencia |
|---|---|---|
| R4.1 schema/DTO/zod | ✓ T | `Product.ts:54-56,64` (`slug` lowercase, `cuts` enum, `soldOut` default, índice parcial único), `cutsFor` `:20-24`, DTO `:97-100,119-121`; `products.admin.ts:27-38` zod (regex C8, max 80, `cuts` ≤2 únicos, polo `[]` → 400 `cuts`), `:64-65` 409 `CONFLICT` `details:[{field:'slug'}]`, `:78-82` `ensureUniqueSlug`, `:110-118` POST, `:147-162` PUT conserva; `errorHandler.ts:17`; tests `products.admin.test.ts:272-450` (slug auto `polo-node-js`, 409, taza→`[]`) |
| R4.2 lookup id/slug | ✓ T/L | `products.public.ts:24-27` `$or` + `published:true`; L redis ≡ id, `nope` 404; tests `:204,219,226,235` |
| R4.3 pedido con `cut` | ✓ T | `orders.public.ts:26,58-83` (`soldOut` → `items.i.productId` "Product is sold out"; `cut` ∉ `cutsFor` → `items.i.cut`; default `allowed[0]`), `Order.ts:19,66,95,125,146`; tests `orders.public.test.ts:316-385` |
| R4.4 migración/seed | ✓ T | `migrate-devhaus.ts:44-94` (4 pasos, idempotente), `:96-113` rollback, `:115-149` CLI `--down`; `api/package.json` `migrate:devhaus`; `seed-products.ts:63-84,100-102` `$setOnInsert` + `migrateDevhaus()`; `products.json` corregido (`liks`, precio string); tests `migrate-devhaus.test.ts:27-99`, `seed-products.test.ts:47,62,111`; índice `slug_1` verificado en Mongo |
| R4.5 backoffice | ✓ T | `ProductForm.tsx:249-266` slug + `/producto/` + "Generar desde nombre", `:101-109` validación ("Selecciona al menos un corte"), `:191` 409 inline, `:300-319` cortes solo polo, `:372-379` Agotado, `:359` tallas ocultas para polo; `ProductList.tsx:64,84-91`; `OrderDetail.tsx:188`; tests `ProductForm.test.tsx:167-325` |
| R4.6 storefront | ◐ C/L | `ProductType.ts:24-32,48`; `data/sizes.ts` (`SIZES_BY_CUT` desde `site.sizes`), `data/cuts.ts:10` `dh-corte` (C3), `:39-42` `CUT_META`, `:61-64` "Solo corte hombre"; `CutSegmented.tsx:67-80` (`role="group" aria-label="Corte"`, `aria-pressed`), visible solo Todos/Polos `CategoryFilters.tsx:69,94,97`; `Card.tsx:286,298,305` silueta/meta/`+` disabled; `cart.ts:12-19,31-41` dedupe `id|cut|color|size|logoPosition`, tope 10; `store/index.ts:28-41` persist v3 sin purga; `OrderService.ts:48`, `orderMessage.ts:31` "Corte: Mujer", `ProductCart.tsx:192-193`, `Tracking.tsx:666,673`; `CartOrder.tsx:157,226` `freeFrom`; `TShirt.tsx:170,194` + `tshirtArt.ts:62-66`. **Parcial**: arte mujer = placeholder de hombre (`isPlaceholder: true`, T4.16 externa); L 19× `data-placeholder="true"` |

### Fase 5
| Req | Estado | Evidencia |
|---|---|---|
| R5.1 ruta + redirección | ✓ C/L | `App.tsx:40-41` rutas planas, sin `state.background`; `LegacyProductRedirect.tsx:13-15` `<Navigate replace …{search}>`; `Home.tsx` sin `<Outlet/>`; `views/Product.tsx` borrado; 404 `ProductPage.tsx:340-347`; L redis + no-such-slug |
| R5.2 galería | ✓ C/L | `ProductGallery.tsx:36-38` thumbs 84×100, `:79-82` main 660/radio 24/`--dh-sand`, `:179-192` Foto/Detalle solo con `images`, `:200-208` flip ⇄ miniatura, `:228,258-260` pie "Modelo mide…" condicional, `:132-160` carrusel+dots ≤640; L deep link `logo=back` → Espalda activa + "Ver frente" |
| R5.3 columna de compra | ✓ C/L | `ProductPage.tsx:396-449` orden (meta condicional `:357-366`, `priceNote()` `ProductInfo.tsx:156-158`, CutSelector, ColorSwatches, LogoPositionPicker, SizePills + guía `SizePills.tsx:186-205`, QuantityStepper 1–10 `QuantityStepper.tsx:55-57`, CTA `AddToCartButton.tsx:70-77` "Agotado" disabled); "Agregado ✓ · Ir al carrito" 3 s `AddToCartButton.tsx:11` + reset al cambiar selección `ProductPage.tsx:308-311`; sin `navigate(-1)`; reset talla a M `useProductSelection.ts:99-106`; WhatsApp `:367-372,438-443`; DeliveryBox `ProductInfo.tsx:63-91`; acordeón `:147-153` |
| R5.4 estado en URL | ✓ C/L | `useProductUrlState.ts:26-57` (defaults `hombre/colors[0]/M/chest`, color por `colorKey`), `:96-108` `replace:true`; L deep link |
| R5.5 SEO | ✓ C/L | `useProductSeo.ts:47-62` (`{nombre} — devhaus.pe` C13, `#product-jsonld`, limpieza al desmontar), `:26-45` `priceCurrency 'PEN'`, `availability` según `soldOut`; L JSON-LD |
| R5.6 relacionados + sticky | ✓ C/L | `RelatedProducts.tsx:16-22` 4 mismo tipo, relleno, excluye actual; `StickyBuyBar.tsx:11-26` ≤640 fixed; `ProductPage.tsx:43-45` padding-bottom; L "Completa el setup" + `aria-label="Comprar"` |
| R5.7 navegación desde catálogo | ✓ C/L | `Card.tsx:218-222` `productPath` `/producto/{slug}?corte=` si polo, `:283,297` `<Link>` sin `state`; L 23 hrefs |

### Conciliación aplicada (verificación cruzada)
C1 `cuts/cut/slug/soldOut` + URL `corte/talla/cat/orden/q/stack/color/logo` ✓ · C2 `sizes.ts`+`cuts.ts` ✓ · C3 `dh-corte` ✓ (0 ocurrencias de `dh-cut`) · C4 `code`, `docType/docNumber`, `claim.*`, 201 `{id, code, createdAt, emailSent}` ✓ · C5 `COMPLAINTS_CODE_PREFIX` + `COMPLAINTS_RATE_LIMIT` 60 min ✓ · C6 host **y** email, log exacto ✓ · C7 `?status&limit&cursor` + `PATCH /:id/status` + lista→detalle ✓ · C8 409 `CONFLICT`, regex, max 80 ✓ · C9 `has`+`isConfigured`+`get` ✓ · C10 `site.webmanifest` + título ✓ · C11 Testimonials borrado ✓ · C12 `null` ✓ · C13 top-3, 3 s, `—` ✓ · C14 `min(1152px, …)` ✓ · C15 `Header.tsx`+`MobileMenu.tsx`, `Navbar.tsx` borrado, `NavbarItems.tsx` conservado ✓ · C16 `products.json` corregido + `seedAndMigrate` ✓ · C17 `items.{i}.cut` / `items.{i}.productId` ✓.

---

## 5. Funciones preservadas (R0.2)

| Escenario | Estado | Evidencia |
|---|---|---|
| Posición del logo + flip | ✓ C/L | `useProductSelection.ts:111-114` `isFlipped = isBackLogoPosition`; `FlipButton.tsx:38-43` "Ver espalda/Ver frente"; `TShirt.tsx:172-176,180-188` animación; L: con `logo=back` aparece "Ver frente", con `chest` no hay botón |
| Búsqueda `?q=` | ✓ C | `SearchBox.tsx:88-95` debounce → `setParam('q')`; `slice:34` filtra por nombre; `parseCatalogParams` `:197-201` |
| Likes (servidor + `likedList`) | ✓ C | `LikeProduct.tsx:31-46` `addLike` + `POST /api/products/:id/like {delta}` (`ProductService.ts:53-58`); `LikeButton.tsx:62-68,80-91` `like.mp3` + `bounce.json`; persistencia: `store/index.ts:43` (`likes` no está en blacklist) |
| Sonido/Lottie al agregar | ✓ C | `NavbarItems.tsx:140,156-163` `added.wav`, `:221-231` `like.json`; `Carrito · N` `:214` |
| Toggle de tema | ✓ C/L | `ThemeSwitch.tsx:20-33` `useDarkMode` (clave `usehooks-ts-dark-mode`) + `click.mp3` + `body.dark-theme`; L `<body class="dark-theme">` renderiza con tokens |
| Carrito persistido v3 | ✓ C | `store/index.ts:28-41` migración `3` asigna `cut:'hombre'` sin purgar; `cartItemKey` incluye `cut` |
| Tracking `/pedido/:id` | ✓ C | `Tracking.tsx:641-687` ítems con corte/talla/color/posición; `App.tsx:46-49` rutas |
| Favoritos | ✓ C/L | `Favorites.tsx:86`; L página vacía con shell |

---

## 6. Placeholders y datos de negocio

- `grep -rnE "\[[A-ZÁÉÍÓÚ/ ]{2,}\]" src index.html` → solo 2 comentarios (`site.ts:3`, `Footer.tsx:168`), **ningún literal en UI**; DOM en vivo: 0 corchetes, 0 `null`.
- Copy hardcodeado fuera de `site.ts`: ninguno de negocio. Los textos "sin uso y con etiqueta", "Los productos personalizados solo se cambian por fallas", "Lavar al revés en agua fría…", "Angular, React, Go, Java y más", "Hechos en Perú" provienen literalmente del handoff (`specs/05-pendientes-negocio.md:36`, `reference/canvas/Producto.dc.html:205-206`, `specs/02-home-catalogo.md:9`, `specs/01-marca-header-footer.md:26`). "S/ 70", "4 stickers", teléfonos: 0 ocurrencias (solo `CartClient.tsx:139` placeholder de input `ejem: 999222333`, preexistente).
- **Claves de `site.ts` aún `null`/`[]` (to-do del usuario)**: `legal.businessName`, `legal.ruc`, `legal.termsText`, `legal.privacyText`, `complaints.responseDays`, `contact.whatsapp`, `contact.hours`, `social.instagram`, `social.tiktok`, `social.other[]`, `shipping.courier`, `shipping.hasTracking`, `shipping.limaDays`, `shipping.provinceDays`, `shipping.freeFrom`, `payments.gateway`, `payments.yapePlinIntegrated`, `product.material`, `product.grammage`, `product.prewashed`, `product.printTechnique`, `product.mousepadSize`, `product.mugMl`, `product.modelHeightCm`, `product.modelSize`, `sizes.hombre.rows[*].anchoPechoCm/largoCm` (5 filas), `sizes.mujer.rows[*].anchoPechoCm/largoCm` (5 filas), `customization.priceIsSurcharge`, `customization.mockupHours`, `returns.days`, `returns.conditions`, `promos.freeStickers`, `reviews.source`. (`product.showSku=false` y `customization.fromPrice=15` son valores definitivos.)

---

## 7. Reglas duras

| Regla | Resultado |
|---|---|
| Sin Tailwind | ✓ 0 ocurrencias en package.json/src (los 3 paquetes) |
| Sin deps nuevas storefront/backoffice | ✓ `git diff 9b8d608 -- package.json backoffice/package.json` vacío |
| api solo `nodemailer` | ✓ `api/package.json`: `nodemailer ^6.10.1` + dev `@types/nodemailer` + script `migrate:devhaus` |
| `.env` intacto | ✓ `git diff 9b8d608 -- .env` vacío (0 líneas) |
| `docs/devhaus-handoff/` ignorado | ✓ `.gitignore:27`; `git check-ignore` confirma |
| Sin `alert/confirm/prompt` en `src` | ✓ storefront 0. Backoffice: 3 `window.confirm` en `ProductList.tsx:26` y `OrderDetail.tsx:87,95` **preexistentes en baseline** (mismas líneas en `9b8d608`), no introducidos por el cambio; `ComplaintDetail` no usa `confirm` |
| Sin `console.log` en producción | ✓ solo `api/src/index.ts:9` (arranque), scripts CLI (`migrate-devhaus.ts`, `seed-products.ts`, `hash-admin-password.ts`) y el texto decorativo del SVG del hero (`Hero.tsx:233`, es contenido, no una llamada) |

---

## 8. Hallazgos (por severidad)

**CRÍTICOS**: ninguno.

**MEDIOS**
1. **Fase 2b sin commit** — 17 archivos modificados + 15 nuevos en el working tree (`git status`). Fix: `git add` de los archivos de 2b y commit `feat(complaints): libro de reclamaciones` (tras revisar §9).
2. **Rate limit cuenta las peticiones 400** — `api/src/routes/complaints.public.ts:112-115` monta `limiter` antes de `validate`: 5 envíos con errores de validación bloquean al consumidor 60 min (aceptado por design §5.2, pero hostil para un formulario legal). Fix (1 línea): mover `limiter` después de `validate(ComplaintCreateSchema)` o contar solo tras el 201.
3. **Datos de prueba en Mongo** — `store.complaints` tiene 4 hojas de prueba `LR-2026-000001…000004` y `counters.complaints-2026.seq=4`: el primer reclamo real saldrá como `000005`. Fix: `db.complaints.deleteMany({})` + `db.counters.deleteOne({_id:'complaints-2026'})` antes de producción (o `docker compose down -v` en un stack limpio).
4. **Arte del corte mujer pendiente (T4.16, externo)** — `src/data/tshirtArt.ts:65` `mujer: {...HOMBRE, isPlaceholder: true}`; 19 mockups en `/?cat=polo&corte=mujer` llevan `data-placeholder="true"`. Fix: recibir `src/assets/images/t-shirt/mujer/{base,filter,base-back,filter-back}.png` + `outline.svg` (1200×1349, un solo `<path>`) y reemplazar la entrada `mujer`.
5. **Mensaje de error del `detail` es `claim.detail`** (spec pedía `field:'detail'`) — `complaints.public.ts:67-70` + `validate` (`issue.path.join('.')`). Consecuencia directa de C4; el storefront lo mapea (`LibroReclamaciones.tsx:88`). Fix: ninguno necesario; actualizar el escenario de `spec.md` R2b.2 al cerrar.

**BAJOS**
6. **`useCatalogUrlSync` reescribe `?corte=` en todas las visitas al catálogo una vez guardado `dh-corte`** — `catalogFilters.ts:211-214` + `useCatalogUrlSync.ts:32`: también en `?cat=taza` (parámetro irrelevante). Fix: no inyectar `corte` desde `storedCut` cuando `cat` ∈ {mousepad, taza}.
7. **`LegacyProductRedirect` redirige a `/` ante error de red** (no solo 404) — `LegacyProductRedirect.tsx:14` usa `!product`. Fix: si `error` (no `notFound`) mostrar el mismo estado de error de `ProductPage`.
8. **`<Outlet/>` muerto en `views/Cart.tsx:48`** — no hay rutas anidadas bajo `/cart`. Fix: quitar import y elemento.
9. **Variables CSS sin uso en `src/Theme.ts`** — heredadas: `--color-star` (StarRating borrado), `--screen-tablet`, `--screen-phone`, `--gradient-brand` (spec solo prohíbe su uso en h1; hoy no se usa en ningún sitio), `--radius-sm`, `--radius-xl`, `--shadow-hover`, `--font-size-hero`, `--font-size-section-title`, `--font-size-text-sm`, `--color-neutral-light`; tokens de marca sin consumidor: `--dh-sage`, `--dh-gap`, `--dh-text-body/small/caption`, `--dh-on-dark-muted`. Fix: borrar las heredadas; los `--dh-*` pueden quedarse por fidelidad a `tokens.css`.
10. **Helpers duplicados** — `slugify` en `api/src/models/slug.ts`, `backoffice/src/api/slug.ts`, `src/data/slug.ts`; `SIZES_BY_CUT` en `api/src/models/sizes.ts` y `src/data/sizes.ts`; hint literal "hombre S–XXL, mujer XS–XL" en `backoffice/src/pages/ProductForm.tsx:359`. Aceptado por design C1 (contextos Docker separados) y solo el api tiene test contra `tallas.json`. Fix: al menos un test en backoffice que compare `slugify` con fixtures compartidos (ya existe `slug.test.ts` con nombres representativos) y documentar en los tres archivos que deben cambiar juntos (ya lo hacen los comentarios).
11. **a11y** — (a) `AddToCartButton.tsx:71` el estado "Agregado ✓ · Ir al carrito" es un `<Link role="status">`: `role=status` anula la semántica de enlace para lectores de pantalla; fix: quitar `role` y anunciar con un `aria-live` aparte. (b) `ThemeSwitch.tsx:37-42` sigue siendo un `motion.div` clickable sin `role="button"`/teclado (preexistente, ahora en el header nuevo). (c) `ProductCart.tsx:199-201` `+`/`−` son `<span onClick>` sin teclado (preexistente). (d) `Favorites.tsx:45-55` la grilla no baja a 1 columna en ≤640 (2 columnas de 180 px de imagen; usable pero denso).
12. **`NavbarItems.tsx:160-163` reproduce `added.wav` al montar si el carrito persistido no está vacío** (efecto con deps `[productsCart]` corre en el primer render) — quirk preexistente, no regresión.
13. **`.env.example:62` conserva `VITE_WHATSAPP_NUMBER=51962940579`** (número real, preexistente en baseline) — coherente con "sin default en código", pero cualquier `.env` copiado del ejemplo publicará ese número. Fix: dejarlo vacío/comentado o confirmar que es el número del negocio.
14. **Drift de documentación** — `README.docker.md` checklist E2E (T6.5, §180-215) no cubre las rutas nuevas (`/producto/:slug`, `/libro-de-reclamaciones`, `/favoritos`, corte hombre/mujer) y el paso 10 describe el mensaje de WhatsApp como `M / #hex / pecho` cuando hoy es `Corte: Hombre · Talla M · Negro · Pecho` (`orderMessage.ts:31-39`). Los comandos y variables sí están al día (§4–§7 migración y SMTP verificados contra `package.json`/`docker-compose.yml`). Fix: añadir 3–4 pasos al checklist.
15. **`Complaint.ip` se persiste** (`Complaint.ts:60`, `complaints.public.ts:129`) sin política de retención documentada; no se expone en el DTO. Fix: documentar en README o eliminar si no se usa para antifraude.
16. **`slug` opcional en el schema mongoose** (`Product.ts:54`; spec decía requerido) con DTO fallback `slug = _id` (`:119`) — desvío documentado y coherente con la migración; sin acción.

---

## 9. Pendientes del usuario (consolidado)

1. **Commit de la fase 2b**: `feat(complaints): libro de reclamaciones` (working tree actual; ver §8.1). Sugerido: incluir también `docs/sdd/devhaus-rebrand/apply-progress.md` y este `verify-report.md`.
2. **`site.ts` (spec 05)**: rellenar las 33 claves listadas en §6; al hacerlo revisar una vez el copy resultante de `/ayuda`, `/envios`, `/cambios`, ficha y Libro (todo se activa solo con `isConfigured`).
3. **Arte corte mujer (T4.16)**: pedir al diseñador `src/assets/images/t-shirt/mujer/base.png`, `filter.png`, `base-back.png`, `filter-back.png`, `outline.svg` (lienzo 1200×1349, `viewBox="0 0 1200 1349"`, un único `<path>` sin `fill/stroke` fijos); luego reemplazar `TSHIRT_ART.mujer` en `src/data/tshirtArt.ts` y quitar `isPlaceholder`. Mientras tanto, considerar activar `cuts:['hombre','mujer']` solo en los polos que realmente existan en corte mujer (hoy todos son `['hombre']`, por eso la UI muestra "Solo corte hombre").
4. **SMTP del Libro** (`.env`, sin rebuild, luego `docker compose up -d api`): `SMTP_HOST`, `SMTP_PORT` (587 o 465 con `SMTP_SECURE=true`), `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (opcional), `COMPLAINTS_EMAIL`; opcionales `COMPLAINTS_CODE_PREFIX` (LR), `COMPLAINTS_RATE_LIMIT` (5).
5. **Número de WhatsApp**: `site.contact.whatsapp` (E.164 sin `+`) o `VITE_WHATSAPP_NUMBER` en `.env` (build-time → `docker compose build storefront`). Decidir sobre el `51962940579` que sigue en `.env.example`.
6. **Migración en producción (una vez, tras desplegar la fase 4)**: `docker compose run --rm api node dist/scripts/migrate-devhaus.js` (idempotente; segunda corrida `0, 0, 0`; rollback `--down`). En el stack local ya está aplicada (índice `slug_1` presente, 23/23 con slug).
7. **Purgar datos de prueba**: `store.complaints` (4 docs `LR-2026-000001…000004`) y `store.counters` `{_id:'complaints-2026'}` antes de salir a producción.
8. **Checklist manual F1–F5 de `tasks.md`** (sonidos/Lottie, menú móvil a 390 px, carrito v2 → v3 en un navegador con datos viejos, "Agregado ✓" 3 s, sticky móvil): pendiente de revisión visual del usuario; el código y el DOM lo respaldan.
9. **Opcional (hallazgos §8.2, 6–14)**: mover el limiter tras la validación, limpiar CSS/`Outlet`, `role="status"` del enlace "Agregado", ampliar el checklist del README.

---

## 10. next_recommended

1. Commit de fase 2b (`feat(complaints): libro de reclamaciones`).
2. Corregir los hallazgos medios 2 y 3 (limiter tras `validate`; purgar complaints de prueba) — pueden ir en un `fix(complaints)` pequeño.
3. Ejecutar la checklist manual F1–F5 en 390/768/1280 (única verificación que este informe no pudo automatizar).
4. `sdd-archive devhaus-rebrand` una vez rellenado `site.ts` con los datos de spec 05 o, si se prefiere archivar ya, registrando §9 como deuda conocida.
