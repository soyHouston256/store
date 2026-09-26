# Spec: devhaus-rebrand

Delta specs por fase (según `proposal.md`). Formato: requisitos RFC 2119 + escenarios Given/When/Then. Backend de artefactos: `none` (este archivo es el artefacto). Las decisiones cerradas en `proposal.md` (A1, B1, C1, D1, E1, F1; nombres de productos = marcas; sin stock por variante; sin reseñas backend) no se reabren aquí.

Dominios tocados: `storefront/`, `api/`, `backoffice/`, `data/` (migración). Todos los dominios son NUEVOS como spec (no existe `openspec/specs/`), pero se escriben como delta sobre el comportamiento actual documentado en `explore.md`.

---

## 0. Requisitos transversales (aplican a todas las fases)

### R0.1 — Configuración de negocio centralizada (`src/config/site.ts`)

El storefront MUST leer todo dato de negocio desde `src/config/site.ts`. Cada valor pendiente MUST estar marcado `// TODO(spec-05)` y valer `null` (escalar), `''` (texto) o `[]` (lista). Ningún componente MUST inventar un valor: cuando la clave es TODO, el fragmento que depende de ella se oculta (comportamiento "hidden") o usa el fallback indicado en la tabla.

| Clave | Tipo | Usado en | Si es TODO |
|---|---|---|---|
| `legal.businessName`, `legal.ruc` | string | footer, Libro | ocultar línea `[RAZÓN SOCIAL] · RUC [N]` |
| `legal.termsText`, `legal.privacyText` | string (markdown simple) | `/terminos`, `/privacidad` | página muestra aviso "Contenido en preparación" y no enlaza desde footer |
| `complaints.responseDays` | number | Libro (texto de plazo) | ocultar frase de plazo |
| `contact.whatsapp` | string (E.164 sin `+`) | todos los CTA WhatsApp | CTAs WhatsApp ocultos; `VITE_WHATSAPP_NUMBER` sobreescribe |
| `contact.hours` | string | FAQ | ocultar frase de horario |
| `social.instagram`, `social.tiktok`, `social.other[]` | string / `{label,url}[]` | footer | ocultar iconos faltantes; sin ninguna, ocultar bloque de redes |
| `shipping.courier`, `shipping.hasTracking` | string / boolean\|null | trust bar, FAQ | trust bar: "Envío a todo el Perú" sin courier; FAQ omite frase de tracking |
| `shipping.limaDays`, `shipping.provinceDays` | number\|null | personalización, ficha, FAQ | omitir fragmento "Lima N días" / "Provincias N días" |
| `shipping.freeFrom` | number\|null | announcement bar, carrito | ocultar "Gratis desde S/ N" y el aviso de delivery gratis del carrito |
| `payments.gateway` | string\|null | trust bar, FAQ, ficha | MUST NOT mostrar "tarjeta" ni "Envío se calcula al pagar"; solo "Yape, Plin o transferencia" |
| `payments.yapePlinIntegrated` | boolean\|null | FAQ | omitir aclaración |
| `product.material`, `product.grammage`, `product.prewashed`, `product.printTechnique` | string / number / boolean\|null / string | trust bar, ficha meta y acordeón | omitir fragmento; ítem de trust bar se reemplaza por "Hecho en Perú" |
| `product.mousepadSize`, `product.mugMl` | string / number\|null | meta tarjeta/ficha | meta muestra solo la categoría |
| `product.showSku` | boolean (default `false`) | ficha | ocultar `SKU …` |
| `product.modelHeightCm`, `product.modelSize` | number\|null / string | galería ficha | ocultar pie "Modelo mide…" |
| `sizes.hombre[]`, `sizes.mujer[]` | `{talla, anchoPechoCm, largoCm}[]` (copia de `tallas.json`) | guía de tallas, filtros, ficha | tabla de medidas solo si todas las filas tienen cm; si no, lista de tallas + aviso |
| `customization.fromPrice` | number (15) | hero, tiles, bloque, footer | — (valor entregado por diseño) |
| `customization.priceIsSurcharge` | boolean\|null | mismo copy | `null` → copy neutro "Desde S/ 15"; `true` → "+ S/ 15 por personalizar" |
| `customization.mockupHours` | number\|null | bloque personalización | paso 03 sin "(en N horas)" |
| `returns.days`, `returns.conditions` | number\|null / string | trust bar, ficha, FAQ | omitir ítem "Cambios en N días" |
| `promos.freeStickers` | number\|null | carrito | ocultar aviso de stickers (`CartOrder.tsx:224-231`) |
| `reviews.source` | string\|null | reseñas | sección no se renderiza |

#### Scenario: Fragmento oculto cuando el valor es TODO
- GIVEN `shipping.freeFrom` es `null`
- WHEN se renderiza la announcement bar
- THEN el texto es `Envío a todo el Perú · Paga con Yape, Plin…` sin el fragmento "Gratis desde"
- AND no aparece la cadena `[S/` ni `null` en el DOM

#### Scenario: Fragmento visible cuando el valor existe
- GIVEN `shipping.freeFrom = 70` y `payments.gateway = 'Culqi'`
- WHEN se renderiza la announcement bar
- THEN el texto es `Envío a todo el Perú · Gratis desde S/ 70 · Paga con Yape, Plin o tarjeta`

### R0.2 — Funciones preservadas (regresión cero)

El sistema MUST conservar las funciones actuales listadas. Cada fase que toque el componente MUST volver a verificar el escenario.

#### Scenario: Posición del logo + flip
- GIVEN un polo con `logoPositions` `['pocket','chest','back','front-back']` abierto en la ficha
- WHEN el usuario elige "Espalda" o "Bolsillo + espalda"
- THEN aparece el botón "Ver espalda/Ver frente" y al pulsarlo el mockup rota mostrando la espalda con el logo
- AND con "Pecho" o "Bolsillo" el botón de flip no se muestra

#### Scenario: Búsqueda
- GIVEN el catálogo cargado con "Polo Docker" y "Polo React"
- WHEN el usuario escribe `dock` en el buscador
- THEN el grid muestra solo "Polo Docker" y la URL contiene `?q=dock`

#### Scenario: Likes local + contador servidor
- GIVEN un producto con `likes = 2`
- WHEN el usuario pulsa el corazón
- THEN se reproduce `like.mp3` con la animación Lottie `bounce.json`, el id entra en `likes.likedList`, se llama `POST /api/products/:id/like {delta:1}` y la tarjeta muestra `3`
- AND tras recargar la página el corazón sigue marcado (persistido)

#### Scenario: Sonido y Lottie al agregar al carrito
- WHEN se agrega un ítem al carrito
- THEN se reproduce `added.wav` y la animación `like.json` sobre el icono del carrito, y `Carrito · N` incrementa

#### Scenario: Toggle de tema
- WHEN se pulsa el toggle de tema
- THEN suena `click.mp3`, `body` alterna `dark-theme` y se persiste en `usehooks-ts-dark-mode`

#### Scenario: Carrito persistido
- GIVEN un carrito con 2 ítems
- WHEN se recarga la pestaña
- THEN los 2 ítems siguen con cantidad, color, talla, posición de logo (y corte desde fase 4)

#### Scenario: Tracking
- GIVEN un pedido creado con id `A1B2C3D4`
- WHEN se visita `/pedido/A1B2C3D4`
- THEN se muestran los ítems con talla/color/posición (y corte desde fase 4) y el estado del pedido

### R0.3 — Verificación estándar de cierre de fase

Cada fase MUST cerrar con estos comandos en verde:

```
npm run build                              # raíz: tsc && vite build
cd api && npm test && npm run build
cd backoffice && npm test && npm run build
grep -rniE "estilos(\.dev)?" src index.html   # MUST devolver vacío desde fase 1
```

---

## Fase 1 — Fundación de marca (`feat(brand): devhaus foundation`)

### ADDED — R1.1 `src/config/site.ts`
El storefront MUST exportar `site` con el contrato de R0.1 y helpers `has(value)` (true si no es `null`/`''`/`[]`). MUST tipar las claves (`as const` + tipo `SiteConfig`).

#### Scenario: Tipado
- WHEN `tsc` compila
- THEN cualquier acceso a una clave inexistente falla en compilación

### ADDED — R1.2 Assets públicos, HTML y meta
- `public/` MUST contener los 8 archivos de `docs/devhaus-handoff/public/` sin renombrar, más `manifest.webmanifest` (`name: devhaus.pe`, `theme_color: #1B1A17`, `background_color: #FAF6F1`, iconos 192/512).
- `index.html` MUST tener `lang="es"`, `<title>devhaus.pe — Polos y accesorios para developers</title>`, meta description exacta de spec 01, `og:title`, `og:description`, `og:image=/og-image.png`, `og:site_name=devhaus.pe`, `twitter:card=summary_large_image`, links a favicons/manifest, el `<link>` de Google Fonts (Bricolage Grotesque 500/700/800, DM Sans 400/500/600, JetBrains Mono 500/700, `display=swap`) y el `<style>` MUST estar dentro de `<head>`.
- `src/favicon.svg`, `src/logo.svg`, `src/data/testimonials.ts` y `Testimonials.tsx` MUST eliminarse.

#### Scenario: OG al compartir
- WHEN un crawler pide `/`
- THEN encuentra `og:image` absoluto o raíz-relativo a `/og-image.png` (1200×630) y `og:site_name = devhaus.pe`

#### Scenario: HTML válido
- WHEN se abre `index.html` en `dist/`
- THEN no hay nodos `<style>` entre `</head>` y `<body>`

### ADDED — R1.3 Tokens y tema
`Theme.ts` MUST declarar todas las variables `--dh-*` de `brand/tokens.css` en `:root` y sus variantes oscuras en `body.dark-theme` (no `[data-theme]`). Las variables `--color-*` existentes MUST re-apuntar a la paleta devhaus (ink/bg/accent/yellow/sand) y `--screen-desktop` MUST valer `1152px`. `--gradient-brand` MUST NOT usarse en el h1.

#### Scenario: Dark mode con tokens
- GIVEN `body.dark-theme`
- WHEN se lee `getComputedStyle(body).getPropertyValue('--dh-bg')`
- THEN devuelve el valor oscuro definido para `--dh-bg` y los componentes antiguos siguen legibles

### MODIFIED — R1.4 Componente de logo
`src/components/Logo.tsx` (`<Estilos/>`) MUST reemplazarse por `DevhausLogo` (adaptación de `brand/components/Logo.tsx`) con props `markSize`, `showChip`, `variant: 'light'|'dark'|'auto'`; en `auto` MUST seguir `body.dark-theme`. Texto accesible `.sr-only` "devhaus.pe".

#### Scenario: Header y footer usan el nuevo logo
- WHEN se renderiza Navbar y Footer
- THEN ambos muestran `DevhausLogo` y no queda ningún `<path>` del logo antiguo en el bundle

### MODIFIED — R1.5 Strings de marca
Todas las apariciones listadas en `explore.md` (`Hero.tsx:295`, `Footer.tsx:146,172`, `Benefits.tsx:106`, `orderMessage.ts:48`, `index.html:10`) MUST decir "devhaus.pe". Los mensajes de WhatsApp prellenados MUST usar "devhaus.pe" y corregir "personalizar uno polo" → "personalizar un polo".

#### Scenario: Grep vacío
- WHEN se ejecuta `grep -rniE "estilos(\.dev)?" src index.html`
- THEN no hay coincidencias

### MODIFIED — R1.6 Número de WhatsApp sin default
`whatsapp.ts` MUST leer `VITE_WHATSAPP_NUMBER ?? site.contact.whatsapp` sin literal hardcodeado. Si ambos vacíos, `buildWhatsappUrl` MUST devolver `null` y los botones que lo usan MUST NOT renderizarse.

#### Scenario: Sin número configurado
- GIVEN `VITE_WHATSAPP_NUMBER` indefinido y `site.contact.whatsapp = ''`
- WHEN se renderiza Hero
- THEN el CTA "Personalizar por WhatsApp" no aparece y "Ver catálogo" sí

### REMOVED — R1.7 Reseñas inventadas
(Razón: decisión "solo reseñas reales"). Sección Testimonials y ancla `#resenas` del footer eliminadas. No hay backend de reseñas en v1, por lo que ninguna sección de reseñas se renderiza.

**API / Backoffice / Migración:** sin cambios. **Verificación:** R0.3.

---

## Fase 2 — Shell (`feat(layout): devhaus header, footer and help pages`)

### ADDED — R2.1 Announcement bar
Barra de 40px sobre el header, fondo `--dh-ink`, texto crema 13px, separadores `·` en `--dh-yellow`. Fragmentos: `Envío a todo el Perú` (siempre) · `Gratis desde S/ {shipping.freeFrom}` (si `has`) · `Paga con Yape, Plin` + ` o tarjeta` solo si `has(payments.gateway)`.

#### Scenario: (ver R0.1 escenarios de announcement bar)

### MODIFIED — R2.2 Header
Alto 84, padding 64 (16 en ≤640), borde inferior `--dh-line`. Izquierda `DevhausLogo markSize=40` → `/`. Nav: Polos (`/?cat=polo`), Mousepads (`/?cat=mousepad`), Tazas (`/?cat=taza`), Personaliza (`/#personaliza`), Ayuda (`/ayuda`). Derecha: "Sigue tu pedido" (`/pedido`), botón buscar 44×44 (enfoca/abre el `SearchBox`), favoritos 44×44 con contador `likes.likedList.length` (abre `/favoritos`), toggle de tema existente, pill `Carrito · N` (`/cart`). En ≤1024 el nav MUST colapsar en menú hamburguesa y el logo MUST usar `showChip=false`.

#### Scenario: Favoritos desde likes
- GIVEN `likedList` con 3 ids
- WHEN se renderiza el header
- THEN el botón favoritos muestra `3` y `/favoritos` lista esas 3 tarjetas (o mensaje vacío)

#### Scenario: Menú móvil
- GIVEN viewport 390px
- WHEN se pulsa el botón hamburguesa
- THEN se muestran los 5 enlaces del nav y "Sigue tu pedido"; `Escape` o pulsar fuera lo cierra

### MODIFIED — R2.3 Footer global
Footer MUST renderizarse en `App.tsx` (todas las rutas, incluidas `/cart`, `/pedido/*`, ficha y páginas legales) y eliminarse de `Home.tsx`. Fondo `--dh-sand-2`, 4 columnas (spec 01). Columna LEGAL: enlace Libro de Reclamaciones con icono de libro, Términos, Privacidad y la línea razón social/RUC (oculta si TODO). Línea inferior: `© {año actual} devhaus.pe. Precios en soles (S/), IGV incluido.` a la izquierda y redes a la derecha (R0.1). El botón "Escríbenos por WhatsApp" MUST respetar R1.6.

#### Scenario: Footer en carrito
- WHEN se visita `/cart` con ítems
- THEN el footer aparece debajo del contenido y no rompe el layout (sin scroll horizontal)

#### Scenario: Legal oculto
- GIVEN `legal.businessName = ''`
- THEN la columna LEGAL no muestra la línea de RUC y `/terminos` no se enlaza si `legal.termsText = ''`

### ADDED — R2.4 Páginas estáticas
Rutas `/ayuda` (FAQ acordeón de spec 05, uno abierto a la vez, primer ítem abierto), `/guia-de-tallas`, `/envios`, `/cambios`, `/terminos`, `/privacidad`. Cada página MUST usar `Container` y copy exclusivamente de `site.ts` según R0.1. `/guia-de-tallas` MUST mostrar por corte: tabla `Talla · Ancho pecho (cm) · Largo (cm)` si hay medidas; si no, la lista de tallas y "Medidas en cm pendientes de confirmación".

#### Scenario: FAQ con placeholders parciales
- GIVEN `shipping.limaDays = 2`, `shipping.provinceDays = null`, `payments.gateway = null`
- WHEN se renderiza `/ayuda`
- THEN la respuesta de envío dice "Lima: 2 días hábiles." sin mención a Provincias, y la de pagos dice "Yape, Plin y transferencia." sin "tarjeta"

#### Scenario: Acordeón exclusivo
- GIVEN el ítem 1 abierto
- WHEN se abre el ítem 3
- THEN el ítem 1 se cierra y solo hay un `aria-expanded="true"`

### ADDED — R2.5 `Container`
Componente compartido con `max-width: var(--screen-desktop)` (1152), padding lateral 64 (≥1025) / 32 (641–1024) / 16 (≤640). Hero, Benefits/TrustBar, SearchBox, Products, CategoryFilters, Footer, Navbar, Cart, Tracking MUST usarlo en lugar de `width: var(--screen-desktop)`.

#### Scenario: Sin overflow móvil
- GIVEN viewport 390px
- WHEN se visita `/`, `/cart`, `/pedido/X`
- THEN `document.documentElement.scrollWidth <= innerWidth`

**API / Backoffice / Migración:** sin cambios. **Verificación:** R0.3 + revisión manual de las 3 rutas en 390/768/1280.

---

## Fase 2b — Libro de Reclamaciones (`feat(complaints): libro de reclamaciones`)

### ADDED — R2b.1 Modelo `Complaint` y `Counter` (API)

| Campo `Complaint` | Tipo | Validación (zod, `POST`) |
|---|---|---|
| `_id` | string uuid | generado |
| `serial` | string único | generado `{PREFIX}-{YYYY}-{NNNNNN}` |
| `consumer.name` | string | trim 2–120 |
| `consumer.documentType` | `'DNI'\|'CE'\|'PASAPORTE'` | enum |
| `consumer.documentNumber` | string | trim 6–20 alfanumérico |
| `consumer.address` | string | trim 5–200 |
| `consumer.phone` | string | trim 6–20 |
| `consumer.email` | string | email, max 120 |
| `consumer.isMinor` | boolean | default false; si `true`, `guardianName` requerido (2–120) |
| `item.kind` | `'producto'\|'servicio'` | enum |
| `item.description` | string | trim 3–200 |
| `item.amount` | number\|null | ≥ 0, opcional |
| `orderId` | string\|null | opcional, 8 chars mayúsculas/dígitos |
| `type` | `'reclamo'\|'queja'` | enum |
| `detail` | string | trim 20–2000 |
| `request` | string | trim 5–1000 (pedido del consumidor) |
| `emailSent` | boolean | interno |
| `createdAt` | Date | timestamps |

`Counter` MUST garantizar correlativo atómico por año (`findOneAndUpdate` con `$inc`, `upsert`). Prefijo por env `COMPLAINTS_SERIAL_PREFIX` (default `LR`).

#### Scenario: Correlativo consecutivo
- GIVEN dos `POST /api/complaints` válidos concurrentes en 2026
- THEN se persisten con `LR-2026-000001` y `LR-2026-000002`, sin duplicados (índice único en `serial`)

### ADDED — R2b.2 `POST /api/complaints` (público)
- Request: JSON con los campos de R2b.1 (sin `serial`, `emailSent`). zod MUST rechazar claves faltantes con `400 VALIDATION` y `details[]` `{field,message}`.
- Response `201`: `{ id, serial, createdAt }`.
- Rate limit in-memory por IP: máx. `COMPLAINTS_RATE_LIMIT` (default 5) por 60 min → `429 { error: { code: 'RATE_LIMITED', message } }` con header `Retry-After`. `ErrorCode` MUST añadir `RATE_LIMITED: 429`.
- Email: si `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `COMPLAINTS_EMAIL` están definidos, MUST enviar (nodemailer) al destino y copia al `consumer.email` con el `serial`; si faltan, MUST guardar igual, `emailSent=false` y loguear una línea `complaints: SMTP not configured`. Un fallo de SMTP MUST NOT hacer fallar la petición (201 con `emailSent=false`).
- `config.ts` MUST tratar las variables SMTP como opcionales; `.env.example` y `docker-compose.yml` MUST listarlas.

#### Scenario: Alta correcta sin SMTP
- GIVEN SMTP no configurado
- WHEN se envía un cuerpo válido
- THEN responde 201 con `serial` y el documento tiene `emailSent=false`

#### Scenario: Validación
- WHEN `detail` tiene 10 caracteres
- THEN responde 400 `VALIDATION` con `details[0].field = 'detail'`

#### Scenario: Rate limit
- GIVEN 5 envíos previos desde la misma IP en la última hora
- WHEN llega el sexto
- THEN responde 429 `RATE_LIMITED` y no se persiste

### ADDED — R2b.3 `GET /api/admin/complaints` (JWT)
Devuelve `ComplaintDTO[]` ordenados por `createdAt desc`, query opcional `?limit` (1–200, default 50) y `?cursor` (createdAt ISO) para paginar. `GET /api/admin/complaints/:id` devuelve uno o `404 NOT_FOUND`. Sin token → `401 UNAUTHORIZED`.

#### Scenario: Listado protegido
- WHEN se pide sin `Authorization`
- THEN 401; con token válido devuelve los registros y `serial` visible

### ADDED — R2b.4 Página `/libro-de-reclamaciones` (storefront)
Formulario con los campos de R2b.1, validación en cliente equivalente, checkbox de aceptación de veracidad, texto legal con `legal.businessName`/`legal.ruc` (oculto si TODO) y plazo de respuesta con `complaints.responseDays` (oculto si TODO). Tras 201 MUST mostrar "Tu hoja de reclamación es {serial}" y ofrecer copiar. Errores 400 MUST mapearse a los campos; 429 MUST mostrar "Demasiados envíos, intenta más tarde"; fallo de red MUST mostrar error genérico sin perder lo escrito.

#### Scenario: Éxito
- WHEN el usuario envía el formulario válido
- THEN ve el `serial` y el formulario se reemplaza por la confirmación

#### Scenario: Prefill desde pedido
- GIVEN URL `/libro-de-reclamaciones?pedido=A1B2C3D4`
- THEN el campo `orderId` viene prellenado

### ADDED — R2b.5 Backoffice `/complaints`
Ruta y enlace en nav. Tabla: Serial, Fecha, Tipo, Consumidor, Bien, Pedido, Email enviado; fila expandible con `detail` y `request`. Estado vacío "Sin reclamaciones". Errores de API con el manejo existente.

#### Scenario: Listado
- GIVEN 2 reclamaciones
- WHEN se abre `/complaints`
- THEN hay 2 filas ordenadas por fecha desc y al expandir se lee el detalle

**Migración:** ninguna (colección nueva). **Verificación:** R0.3 + tests vitest: correlativo, zod, rate limit, SMTP ausente, auth de admin; test de `ComplaintList` en backoffice.

---

## Fase 3 — Home + catálogo (`feat(home): catalog per spec 02`)

### MODIFIED — R3.1 Carga y errores del catálogo
`useProductsList` MUST exponer `{ products, loading, error }`. `Products` MUST mostrar `CardShimmer` solo con `loading`, un estado de error con botón "Reintentar" con `error`, "Aún no hay diseños" con lista vacía, y el conteo `N diseños` solo con data. (Previamente: `isLoading = !products.length` y "0 diseños" durante la carga.)

#### Scenario: Error de API
- GIVEN `GET /api/products` responde 500
- THEN no hay shimmers infinitos, se ve el error y "Reintentar" vuelve a pedir

#### Scenario: Carga
- WHILE la petición está pendiente
- THEN se ven shimmers y no aparece "0 diseños"

### ADDED — R3.2 DTO público con `createdAt`
`ProductDTO` MUST incluir `createdAt` (ISO). (API.)

#### Scenario: DTO
- WHEN se pide `GET /api/products`
- THEN cada ítem tiene `createdAt` parseable por `Date`

### MODIFIED — R3.3 Hero
Según spec 02 §1: línea mono `$ git checkout -b tu-estilo`, h1 "Estilo y comodidad" + "a tu medida" en `--dh-accent` sin degradado, párrafo con `customization.fromPrice`, CTAs "Ver catálogo" (scroll a `#catalogo`) y "Personalizar por WhatsApp" (R1.6), etiqueta flotante "Polos S/ {precio mínimo de polos} · Personaliza desde S/ {fromPrice}" (precio calculado de la data; oculto mientras carga). Panel derecho con 3 mockups procedurales en abanico hasta tener fotos.

#### Scenario: Etiqueta con precio real
- GIVEN polos con precios 60 y 65
- THEN la etiqueta dice "Polos S/ 60 · Personaliza desde S/ 15"

### ADDED — R3.4 Tiles de categoría
Grid 4 (2 en ≤1024, 1 en ≤640): Polos (`Hombre y mujer · N diseños →` — "Hombre y mujer" solo desde fase 4, antes "N diseños →"), Mousepads, Tazas, Tu diseño ("Desde S/ 15 →", enlace a `#personaliza`). `N` MUST ser el conteo real de productos publicados por tipo; tile sin conteo mientras carga. Click MUST fijar `?cat=` y hacer scroll al catálogo.

#### Scenario: Conteo real
- GIVEN 19 polos, 2 tazas, 2 mousepads publicados
- THEN los tiles muestran 19 / 2 / 2

### MODIFIED — R3.5 Filtros, orden y URL
Estado en `useSearchParams` sincronizado con el slice `products` (fuente de verdad: URL). Parámetros: `cat` (`polo|mousepad|taza`), `q`, `stack`, `color`, `talla`, `orden` (`vendidos|novedades|precio`), y `corte` desde fase 4. Chips (Todos/Polos/Mousepads/Tazas), dropdowns Stack (claves de `productLogos` presentes en la data), Color (unión de `colors`, nombre por `colorNames`), Talla (unión de `sizes`; desde fase 4, tallas del corte activo). Orden: `vendidos` = `likes desc` (proxy documentado), `novedades` = `createdAt desc`, `precio` = `price asc`; default `vendidos`. Parámetros inválidos MUST ignorarse. Botón "Ver los N diseños" MUST hacer scroll al grid y N = resultados filtrados. En ≤640 la fila de filtros MUST hacer scroll horizontal.

#### Scenario: Deep link
- WHEN se abre `/?cat=taza&orden=precio`
- THEN el chip Tazas está activo, el select en "Precio: menor a mayor" y el grid ordenado ascendente

#### Scenario: Parámetro inválido
- WHEN se abre `/?cat=zapato`
- THEN se muestra "Todos" y la URL se normaliza sin `cat`

#### Scenario: Volver atrás
- GIVEN el usuario filtró Polos y luego Tazas
- WHEN pulsa Atrás
- THEN vuelve al estado Polos (historial por `replace:false` en cambios de filtro)

### MODIFIED — R3.6 Tarjeta de producto
Imagen 300 alto fondo `--dh-sand` (mockup procedural con `colors[0]` o el color filtrado si aplica); badge "Más vendido" si el producto está en el top 3 de likes del catálogo y "Nuevo" si `createdAt` < 30 días (prioridad: Más vendido); favorito 44×44 arriba-der (LikeButton preservado); puntos de color 14px (máx. 6, `+N`); nombre como link a la ficha (fase 5; antes navega a `/product/:id`); meta 13px: polos `S–L` (rango de `sizes`; desde fase 4 por corte), mousepad `product.mousepadSize`, taza `{mugMl} ml` (ocultos si TODO); precio Bricolage 20/700; botón `+` 44 acento. `+` MUST agregar con talla por defecto (`M` si existe, si no la primera) y `colors[0]` y logo `chest` si aplica, con sonido/Lottie de R0.2; MUST NOT navegar.

#### Scenario: Agregar rápido
- WHEN se pulsa `+` en "Polo Docker" (tallas S,M,L, colores #FFF,#000)
- THEN el carrito recibe `{ size:'M', color:'#FFF', logoPosition:'chest', quantity:1 }` y `Carrito · 1`

#### Scenario: Badge Nuevo
- GIVEN `createdAt` hace 3 días y no top 3 en likes
- THEN la tarjeta muestra "Nuevo"

### ADDED — R3.7 Personalización, barra de confianza y FAQ en home
- `Customize` (`id="personaliza"`): título "Tu stack, tu diseño. Desde S/ {fromPrice}.", CTA amarillo "Empezar por WhatsApp →" (R1.6), 4 pasos; paso 03 con "(en {mockupHours} horas)" y 04 con "Lima N días · Provincias N días" solo si `has`.
- `TrustBar` reemplaza `Benefits`: 4 ítems con las reglas de R0.1 (courier, pasarela, cambios, material/técnica).
- `Faq` en home reutiliza el acordeón de `/ayuda`.

#### Scenario: Trust bar sin datos
- GIVEN todas las claves TODO
- THEN los 4 ítems son: "Envío a todo el Perú", "Yape, Plin o transferencia", "Hecho en Perú", "Personaliza desde S/ 15" — sin corchetes ni `null`

**Backoffice / Migración:** sin cambios. **Verificación:** R0.3 + test api del DTO (`createdAt`) + manual: `/?cat=polo&orden=novedades`, API caída (`VITE_API_URL` inválido) muestra error.

---

## Fase 4 — Modelo de datos (`feat(product): cut, slug and soldOut`)

### ADDED — R4.1 Schema y DTO de producto (API)

| Campo | Schema | zod (`ProductWriteSchema`) | DTO |
|---|---|---|---|
| `cuts` | `[String enum 'hombre'\|'mujer']`, default `['hombre']` si `type='polo'`, `[]` si no | opcional, únicos, 1–2; para `polo` vacío → error `cuts`; para no-polo se fuerza `[]` | `cuts: Cut[]` |
| `slug` | `String`, único (índice `unique`), requerido | opcional; `^[a-z0-9]+(-[a-z0-9]+)*$`, 1–80; si ausente en POST se genera de `name`; en PUT ausente → conserva | `slug` |
| `soldOut` | `Boolean`, default `false` | opcional boolean | `soldOut` |

Colisión de `slug` (POST/PUT) MUST responder `409 { error: { code: 'CONFLICT', message, details:[{field:'slug'}] } }` (nuevo `ErrorCode`). Generación: slugify propio (minúsculas, sin acentos, `-`), sufijo `-2`, `-3`… hasta libre.

#### Scenario: Slug automático
- WHEN POST admin `{ name: 'Polo Node.js', price: 60, type: 'polo' }`
- THEN 201 con `slug: 'polo-node-js'`, `cuts: ['hombre']`, `soldOut: false`

#### Scenario: Slug duplicado
- GIVEN existe `polo-react`
- WHEN PUT de otro producto con `slug: 'polo-react'`
- THEN 409 `CONFLICT`

#### Scenario: Taza con cortes
- WHEN POST `{ type: 'taza', cuts: ['mujer'] }`
- THEN se persiste `cuts: []`

### MODIFIED — R4.2 Lookup público por id o slug
`GET /api/products/:idOrSlug` MUST resolver `{$or:[{_id},{slug}], published:true}`. `POST /api/products/:id/like` sigue por `_id`. Listado público MUST seguir incluyendo productos `soldOut` (se muestran como agotados).

#### Scenario: Por slug
- WHEN `GET /api/products/polo-docker`
- THEN 200 con el mismo DTO que por id

### MODIFIED — R4.3 Pedido con corte
`OrderCreateSchema.items[]` MUST aceptar `cut` opcional (`hombre|mujer`). Validación: si el producto es `polo`, `cut` MUST estar en `product.cuts` (default `hombre` si ausente y el producto lo tiene); si el producto tiene `soldOut=true` → `400 VALIDATION` `items.i.productId` "Product is sold out". `Order.items[]` snapshot y `OrderDTO`/tracking DTO MUST incluir `cut`.

#### Scenario: Corte inexistente
- GIVEN polo con `cuts:['hombre']`
- WHEN se envía `cut:'mujer'`
- THEN 400 `VALIDATION` con `field: 'items.0.cut'`

#### Scenario: Agotado
- WHEN un ítem referencia un producto `soldOut`
- THEN 400 `VALIDATION`

### ADDED — R4.4 Migración `migrate-devhaus.ts`
Script `npm run migrate:devhaus` en `api/`, idempotente: (1) `cuts:['hombre']` a polos sin `cuts`, `[]` a no-polos; (2) `soldOut:false` donde falte; (3) `slug` generado de `name` para docs sin slug, resolviendo colisiones con sufijo; (4) crear índice único `slug` al final. `--down` MUST hacer `$unset` de los tres campos y `dropIndex`. Seed (`seed-products.ts`) MUST incluir los tres campos en `$setOnInsert` para docs nuevos y ejecutar la migración al final. `products.json`: corregir `liks`→`likes` y precio string→number.

#### Scenario: Idempotencia
- WHEN se ejecuta dos veces sobre la misma base
- THEN la segunda ejecución no modifica documentos (`modifiedCount = 0`) y no falla por índice

#### Scenario: Colisión
- GIVEN dos productos "Polo React"
- THEN quedan `polo-react` y `polo-react-2`

### MODIFIED — R4.5 Backoffice `ProductForm` / `ProductList` / `OrderDetail`
- Form: checkbox "Agotado"; para `polo`, checkboxes "Corte hombre"/"Corte mujer" (mínimo uno); campo `slug` editable con botón "Generar desde nombre" y prefijo visual `/producto/`; 409 MUST mostrarse inline en `slug`; campo `sizes` MUST ocultarse para `polo` (legado; las tallas vienen de la tabla por corte).
- List: columna "Slug" y badge "Agotado".
- OrderDetail: mostrar `Corte` por ítem cuando exista.

#### Scenario: Validación de cortes
- WHEN se desmarcan ambos cortes en un polo y se guarda
- THEN el formulario bloquea con "Selecciona al menos un corte"

### MODIFIED — R4.6 Storefront: tipos, tallas, filtros, tarjeta, carrito, pedido
- `ProductType` añade `cuts`, `slug`, `soldOut`, `createdAt`; `ProductCartType` añade `cut`.
- `src/data/sizes.ts` exporta `SIZES_BY_CUT` desde `site.sizes` (fuente `tallas.json`) y `CUT_LABELS` (`Hombre — corte recto` / `Mujer — entallado`, descripciones de spec 04).
- Filtro `corte` (segmented `role="group" aria-label="Corte"`, `aria-pressed`) junto a los chips, solo visible con `cat=polo` o Todos; default `hombre`; última elección MUST recordarse en `localStorage` (`dh-cut`). Polos sin el corte activo MUST mostrarse con etiqueta "Solo corte hombre" (default de explore, no ocultar). Dropdown Talla MUST listar las tallas del corte activo.
- Tarjeta: mockup MUST usar la silueta del corte activo; meta `Hombre · corte recto · S–XXL` / `Mujer · entallado · XS–XL`; producto `soldOut` MUST mostrar badge "Agotado" (prioridad sobre otros), `+` deshabilitado.
- `TShirt` MUST aceptar `cut` y renderizar path + PNG del corte mujer (arte real o derivación placeholder aprobada), frente y espalda, conservando las posiciones del logo.
- Carrito: persist `version: 3` con migración que asigna `cut:'hombre'` a ítems polo sin `cut`; deduplicación por `id+cut+color+size+logoPosition` (reemplaza el `_id` aleatorio); `ProductCart` muestra el corte.
- `OrderService` envía `cut`; `orderMessage` incluye `Corte: Mujer`; `Tracking` muestra corte; aviso de delivery gratis usa `shipping.freeFrom` (R0.1).

#### Scenario: Cambio de corte en catálogo
- GIVEN `?cat=polo&corte=mujer`
- THEN los mockups usan silueta mujer, la meta dice `Mujer · entallado · XS–XL`, el dropdown Talla ofrece XS–XL y el polo sin corte mujer muestra "Solo corte hombre"

#### Scenario: Migración del carrito persistido
- GIVEN `localStorage` con `persist` v2 y un polo sin `cut`
- WHEN carga la app
- THEN el ítem aparece con `cut:'hombre'` y nada se purga

#### Scenario: Deduplicación
- WHEN se agrega dos veces el mismo polo con igual corte/color/talla/posición
- THEN hay una línea con `quantity: 2`

**Verificación:** R0.3 + tests api (zod cuts/slug/soldOut, `$or`, 409, orden con `cut`/`soldOut`, migración idempotente en mongodb-memory-server o mock) + tests backoffice (`ProductForm` cortes/slug/agotado) + manual: `npm run migrate:devhaus` dos veces.

---

## Fase 5 — Ficha `/producto/:slug` (`feat(product-page): /producto/:slug`)

### ADDED — R5.1 Ruta y redirección
`/producto/:slug` MUST ser una página completa (no modal) con `Container`. `/product/:id` MUST resolver el producto por id y redirigir con `replace` a `/producto/{slug}` conservando query. Slug desconocido o producto no publicado → vista 404 "No encontramos ese producto" con enlace al catálogo. La home MUST dejar de renderizar `<Outlet/>` para el modal.

#### Scenario: Redirección legada
- WHEN se visita `/product/abc123` de un producto con slug `polo-docker`
- THEN la URL pasa a `/producto/polo-docker` sin entrada extra en el historial

### ADDED — R5.2 Galería
Miniaturas verticales 84×100 (borde 2px tinta en activa): "Frente" y "Espalda" siempre (mockups procedurales según corte, color y posición de logo); "Foto con modelo" y "Detalle del estampado" solo si el producto trae imágenes (no existen en v1 → ocultas). Imagen principal 660 alto, radio 24, fondo `--dh-sand`, badge según R3.6/R4.6. Pie "Modelo mide…" solo con `product.modelHeightCm` y `modelSize`. Flip de R0.2 MUST cambiar la miniatura activa y viceversa. En ≤640 carrusel con dots.

#### Scenario: Galería sincronizada con flip
- GIVEN posición "Espalda"
- WHEN se pulsa "Ver espalda"
- THEN la miniatura "Espalda" queda activa; al pulsar la miniatura "Frente" el mockup vuelve al frente

### ADDED — R5.3 Columna de compra
Orden: (1) h1 + meta `{Corte} · {material} · SKU {código}` (fragmentos ocultos si TODO/`showSku=false`); (2) precio `S/ 60.00` + "IGV incluido" + " · Envío se calcula al pagar" solo si `has(payments.gateway)`; (3) Corte (polo con ≥2 cuts: segmented spec 04 con siluetas; 1 cut: etiqueta fija); (4) Color swatches 44 con nombre (`colorNames`); (5) Posición del logo (selector actual, preservado) y (6) Talla: pills 60×48 del corte activo; si `soldOut`, todas deshabilitadas y tachadas; link "Guía de tallas" despliega la tabla del corte activo (regla R2.4); (7) Cantidad 1–10 con stepper (`−` deshabilitado en 1, `+` en 10) + botón "Agregar al carrito · S/ {precio×cantidad}"; con `soldOut` el botón dice "Agotado" y está `disabled`; (8) "Personalizar este diseño por WhatsApp" (R1.6) con mensaje `Hola devhaus.pe, quiero personalizar {nombre} (corte {corte}, color {color}, talla {talla})`; (9) caja de entrega con fragmentos condicionados (`limaDays`, `provinceDays`, `returns.days`, medios de pago según `payments.gateway`); (10) acordeón Descripción · Material y cuidado (`product.*`) · Envíos y cambios (`shipping.*`, `returns.*`), un panel abierto.

Tras agregar: el botón MUST pasar a "Agregado ✓ · Ir al carrito" (link a `/cart`) durante 3 s o hasta cambiar selección, `Carrito · N` MUST incrementar, sonido/Lottie de R0.2, sin `navigate(-1)`. Cambiar de corte MUST resetear la talla a `M` si la actual no existe en el nuevo corte.

#### Scenario: Agregar
- GIVEN corte mujer, color Negro, talla S, cantidad 2, posición Pecho
- WHEN se pulsa "Agregar al carrito · S/ 120.00"
- THEN el carrito tiene `{cut:'mujer', color:'#1B1A17', size:'S', logoPosition:'chest', quantity:2}` y el botón muestra "Agregado ✓ · Ir al carrito"

#### Scenario: Reset de talla al cambiar corte
- GIVEN corte hombre y talla XXL
- WHEN se elige corte mujer
- THEN la talla pasa a M y la guía de tallas titula "Medidas corte mujer (entallado)"

#### Scenario: Agotado
- GIVEN `soldOut = true`
- THEN las tallas están tachadas y `disabled`, el botón dice "Agotado" y `+` de la tarjeta también está deshabilitado

#### Scenario: Cantidad
- WHEN se pulsa `+` diez veces desde 1
- THEN la cantidad es 10 y `+` queda deshabilitado

### ADDED — R5.4 Estado en URL
`?corte=`, `?color=` (slug del nombre de color, fallback hex sin `#`), `?talla=`, `?logo=` (posición) MUST leerse al montar y escribirse con `replace` al cambiar. Valores inválidos MUST ignorarse y caer en defaults (`hombre`/`colors[0]`/`M`/`chest`).

#### Scenario: Deep link de selección
- WHEN se abre `/producto/polo-docker?corte=mujer&color=negro&talla=M`
- THEN la UI refleja esa selección y el mockup usa la silueta mujer en negro

### ADDED — R5.5 SEO y título
`document.title` MUST ser `{nombre} — devhaus.pe` y se MUST inyectar un `<script type="application/ld+json">` `Product` con `name`, `image` (og o mockup), `offers.price`, `priceCurrency: 'PEN'`, `availability` (`InStock` / `OutOfStock` según `soldOut`); ambos se limpian al desmontar.

#### Scenario: JSON-LD
- WHEN se monta la ficha de un producto agotado
- THEN el JSON-LD tiene `availability: "https://schema.org/OutOfStock"` y `priceCurrency: "PEN"`

### ADDED — R5.6 Relacionados y móvil
"Completa el setup": 4 productos publicados del mismo tipo (o cualquier tipo si faltan), excluyendo el actual, con la tarjeta de R3.6. En ≤640 MUST haber barra fija inferior con precio y "Agregar al carrito" (mismo estado que el botón principal), con `padding-bottom` para no tapar contenido.

#### Scenario: Relacionados
- GIVEN 19 polos publicados
- WHEN se abre un polo
- THEN se listan 4 polos distintos del actual

### MODIFIED — R5.7 Navegación desde el catálogo
Nombre e imagen de la tarjeta MUST enlazar a `/producto/{slug}` (con `?corte=` activo si es polo). `Card` MUST NOT usar `location.state.background`; el código legado del modal en `App.tsx` MUST eliminarse.

#### Scenario: Click en tarjeta
- GIVEN filtro `corte=mujer`
- WHEN se pulsa el nombre de "Polo Docker"
- THEN se navega a `/producto/polo-docker?corte=mujer`

**API / Backoffice / Migración:** sin cambios (usa R4.x). **Verificación:** R0.3 + manual: `/product/:id` redirige; deep link R5.4; JSON-LD válido en el validador de schema.org; lighthouse móvil sin overflow; escenarios de R0.2 completos.

---

## Cobertura

| Fase | Requisitos | Escenarios | Happy / Edge / Error |
|---|---|---|---|
| 0 (transversal) | 3 | 10 | ✓ / ✓ / ✓ |
| 1 | 7 (5 added, 1 modified, 1 removed) | 8 | ✓ / ✓ / – |
| 2 | 5 | 9 | ✓ / ✓ / – |
| 2b | 5 | 10 | ✓ / ✓ / ✓ |
| 3 | 7 | 12 | ✓ / ✓ / ✓ |
| 4 | 6 | 14 | ✓ / ✓ / ✓ |
| 5 | 7 | 11 | ✓ / ✓ / ✓ |
