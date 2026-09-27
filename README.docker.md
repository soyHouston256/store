# Store — Docker / deploy guide

Three apps, one compose stack:

| Piece | Where | Serves |
|---|---|---|
| storefront | repo root (Vite 2 + React) | public shop UI |
| backoffice | `backoffice/` (Vite 5 + React) | admin UI |
| api | `api/` (Express + Mongoose, TS) | `/api/*` + `/uploads/*` |

Prod topology (`docker-compose.yml`): `mongo` (volume `mongo_data`) → `api`
(volume `uploads_data`) → nginx-served SPA images → `caddy` (the ONLY service
publishing ports, 80/443, automatic TLS). One bridge network.

`VITE_API_URL` is **build-time**: vite inlines it into both frontend bundles.
Changing it means rebuilding `storefront` and `backoffice` images.

---

## Local development

Run mongo + api in Docker, frontends with local vite:

```bash
cp .env.example .env            # fill JWT_SECRET / ADMIN_* (see below); for dev
                                # CORS_ORIGINS=http://localhost:3001,http://localhost:5173

docker compose -f docker-compose.yml -f docker-compose.dev.yml up mongo api
# api: tsx watch over bind-mounted ./api/src, on http://localhost:3000
# mongo: published on localhost:27017

# seed (dev image runs from src via tsx):
docker compose -f docker-compose.yml -f docker-compose.dev.yml \
  run --rm api npx tsx src/scripts/seed-products.ts

# storefront (vite 2 defaults to port 3000 — that's the api's, pick 3001):
npm install && npm run dev -- --port 3001          # http://localhost:3001

# backoffice:
cd backoffice && npm install && npm run dev        # http://localhost:5173
```

Both frontends read `VITE_API_URL` (already `http://localhost:3000` in the
root `.env`; the backoffice takes it from the shell or its own `.env`).
`storefront`/`backoffice`/`caddy` are disabled in the dev overlay (profile
`prod-only`).

Without Docker at all: run a local `mongod`, then `cd api && npm run dev`
(api reads plain env vars, e.g. `MONGO_URI=mongodb://localhost:27017/store`).

---

## Production bring-up (VPS)

1. **DNS** — create three A (and/or AAAA) records pointing at the VPS:
   `store.<domain>`, `admin.<domain>`, `api.<domain>`. Caddy provisions
   Let's Encrypt certificates automatically once they resolve (ports 80+443
   must be reachable).

2. **Env** — `cp .env.example .env` and fill:
   - `DOMAIN=<domain>` (apex only; subdomains are derived)
   - `VITE_API_URL=https://api.<domain>`
   - `CORS_ORIGINS=https://store.<domain>,https://admin.<domain>`
   - `JWT_SECRET=$(openssl rand -base64 48)`
   - `ADMIN_USER` + `ADMIN_PASSWORD_HASH` — generate the hash:

     ```bash
     cd api && npm ci
     npx tsx src/scripts/hash-admin-password.ts 'your-admin-password'
     # paste into .env WRAPPED IN SINGLE QUOTES — compose interpolates bare $:
     #   ADMIN_PASSWORD_HASH='$2b$12$...'
     ```

3. **Build + start**:

   ```bash
   docker compose build
   docker compose up -d
   ```

4. **Seed the catalog** (idempotent — `$setOnInsert` only: re-running never
   duplicates products nor overwrites admin edits; `products.json` is
   bind-mounted read-only at `/seed/products.json` and passed via `SEED_FILE`):

   ```bash
   docker compose run --rm api node dist/scripts/seed-products.js
   # → "23 inserted, 0 already present" on first run; "0 inserted, 23 already present" after
   ```

5. **Migración devhaus (fase 4)** — backfills the phase-4 product fields on
   rows that predate them (`cuts`, `slug`, `soldOut`) and builds the unique
   `slug_1` index. Idempotent and additive: the first run reports how many
   rows it touched, every later run reports `0, 0, 0`. The seed already
   writes the three fields for new rows *and* runs this migration at the
   end, so on an empty database the order seed → migrate is indifferent;
   on an existing (pre-fase-4) database run it once after deploying the
   new api image:

   ```bash
   # prod image (compiled dist):
   docker compose run --rm api node dist/scripts/migrate-devhaus.js
   # → "cuts set on 23, soldOut set on 23, slug set on 23 product(s); index slug_1 ensured."
   # second run → "cuts set on 0, soldOut set on 0, slug set on 0 product(s); …"

   # dev overlay (tsx image, runs from src):
   docker compose -f docker-compose.yml -f docker-compose.dev.yml \
     run --rm api npx tsx src/scripts/migrate-devhaus.ts
   # (equivalent: `cd api && MONGO_URI=… npm run migrate:devhaus`)
   ```

   Rollback (`--down`) `$unset`s the three fields on every product and drops
   `slug_1`; the api keeps serving (slug falls back to the id, cuts to the
   type default) but `/producto/:slug` links stop resolving by slug:

   ```bash
   docker compose run --rm api node dist/scripts/migrate-devhaus.js --down
   ```

   Verify: `curl -s https://api.<domain>/api/products | jq '.[0] | {slug, cuts, soldOut}'`
   and `curl -s https://api.<domain>/api/products/<slug>` returns the product.

6. Visit `https://admin.<domain>` (login with `ADMIN_USER` + the plaintext
   password you hashed) and `https://store.<domain>`.

7. **Libro de Reclamaciones (SMTP opcional)** — `store.<domain>/libro-de-reclamaciones`
   works out of the box: every hoja is stored in Mongo (`complaints`
   collection) with a per-year correlativo `LR-YYYY-000001` (prefix
   `COMPLAINTS_CODE_PREFIX`) and listed in the backoffice under
   *Reclamaciones*. Email is optional: the api creates an SMTP transport only
   when **both** `SMTP_HOST` and `COMPLAINTS_EMAIL` are set. Without them the
   complaint is still saved, `POST /api/complaints` answers
   `emailSent:false`, the storefront shows the code on screen (and omits
   "te enviamos una copia") and the api logs
   `complaints: SMTP not configured` at boot and once per complaint.

   To enable mail, fill in `.env` (all runtime vars — no image rebuild, just
   `docker compose up -d api`):

   ```bash
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587            # 465 with SMTP_SECURE=true
   SMTP_SECURE=false
   SMTP_USER=libro@example.com   # optional: auth only when USER+PASS are set
   SMTP_PASS='app-password'
   SMTP_FROM="Libro de Reclamaciones <libro@example.com>"   # defaults to SMTP_USER
   COMPLAINTS_EMAIL=reclamos@example.com   # receives every hoja; consumer gets a cc
   ```

   An SMTP failure never fails the request (201 with `emailSent:false`,
   error in `docker compose logs api`).

   Abuse control: `COMPLAINTS_RATE_LIMIT` (default 5) requests per client IP
   per 60 minutes, kept in memory (fine for the single api replica; it resets
   on restart). Only submissions that pass validation count against the
   quota — a 400 never consumes it, so a consumer fixing form errors is not
   locked out. Each stored complaint keeps the submitting `ip` (never exposed
   by the API; delete it from Mongo if you adopt a retention policy). The api
   runs with `app.set('trust proxy', 1)` so the IP it
   limits is the one Caddy forwards in `X-Forwarded-For`, not Caddy's own —
   if you ever put a second proxy in front of Caddy, raise that hop count.

   Smoke test:

   ```bash
   curl -s -X POST https://api.<domain>/api/complaints -H 'content-type: application/json' \
     -d '{"consumer":{"name":"Ada Lovelace","docType":"DNI","docNumber":"12345678","email":"ada@example.com","phone":"999888777","address":"Av. Siempre Viva 742, Lima"},"item":{"kind":"producto","description":"Polo Docker talla M"},"claim":{"type":"reclamo","detail":"El polo llegó con el estampado descentrado y una mancha.","request":"Cambio por uno nuevo."},"acceptsTerms":true}'
   # → 201 {"id":"…","code":"LR-2026-000001","createdAt":"…","emailSent":false}
   # the 6th call within the hour from the same IP → 429 {"error":{"code":"RATE_LIMITED",…}}
   ```

Operational notes:

- `uploads_data` and `mongo_data` volumes are the system state — back them up.
  `caddy_data` holds TLS certs (keep it to avoid re-issuing on every restart).
- `/uploads/*` MUST stay served by the api (Caddy proxies it): its
  `Content-Security-Policy: default-src 'none'; …; sandbox` +
  `X-Content-Type-Options: nosniff` headers are what neutralize malicious
  SVG uploads. Never move uploads to nginx/Caddy static serving.
- Changing `VITE_API_URL`/`DOMAIN` → `docker compose build storefront backoffice && docker compose up -d`.
- Logs: `docker compose logs -f api caddy`.

---

## Manual E2E checklist (T6.5)

Run top-to-bottom on a fresh stack (`docker compose down -v` first for truly
clean state). Prod domains shown; substitute localhost ports for dev.

1. **Clean bring-up**: `docker compose build && docker compose up -d` — all 5
   services healthy (`docker compose ps`), only caddy publishes ports.
2. **Seed**: run the seed command → 23 inserted. Run it again → 0 inserted,
   23 already present (no dupes, no clobber). The seed's trailing
   `migrate-devhaus` line reads `0, 0, 0` both times (new rows already
   carry `slug`/`cuts`/`soldOut`).
3. **Login**: `https://admin.<domain>` — wrong password → single generic
   error (does not say which field failed), username stays filled. Correct
   login → product table listing all 23 (published) products.
4. **Create**: new `taza` and new `mousepad` (name, price, a couple of hex
   colors; no sizes). Both appear in the admin list as unpublished; NOT in
   the storefront.
5. **Upload logo** (edit page):
   - valid SVG ≤ 200 KB → thumbnail appears, file served under
     `api.<domain>/uploads/…`
   - PNG > 200 KB → "supera 200 KB" (413)
   - a JPEG (or HTML renamed .svg) → unsupported type (415)
6. **Upload headers**: `curl -sI https://api.<domain>/uploads/<file>` →
   `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox`,
   `X-Content-Type-Options: nosniff`, `Content-Disposition: inline`,
   `Cache-Control: … immutable`.
7. **Publish**: toggle the taza + mousepad published → they appear on
   `https://store.<domain>` with the SVG mockup + logo overlay.
8. **Storefront browse**: product pages live at `/producto/<slug>`
   (`/product/<id>` redirects there; an unknown slug shows "No encontramos
   ese producto"). A taza page shows colors only (no cut, no sizes, no
   logo-position, no flip button) and is addable to cart with just a color;
   a polo shows the cut selector (Hombre / Mujer, only when the product has
   both cuts), size pills (S–XXL hombre, XS–XL mujer; M preselected, a size the new cut lacks falls back to M),
   logo position and the flip button, and its selection is mirrored in the
   URL (`?corte=&color=&talla=&logo=`). Home filters (`/?cat=polo&corte=mujer`)
   keep the chosen cut across visits. `/favoritos` lists hearted products
   with the global header/footer.
9. **Like/unlike**: heart a product → count +1 (persists on reload); unheart
   → −1; a product at 0 never goes negative.
10. **Order**: cart with one polo (size+position) and one taza (color only) →
    confirm → order message lists `Corte: Hombre · Talla M · Negro · Pecho`
    for the polo, only the color name for the taza, never "undefined"; order
    code is the server's 8-char id; total matches server recomputation. The
    WhatsApp hand-off only appears when `VITE_WHATSAPP_NUMBER` /
    `site.contact.whatsapp` is set; otherwise the flow ends on `/done`.
11. **CORS**: from a browser console on some other origin,
    `fetch('https://api.<domain>/api/products')` is blocked (no ACAO header);
    from the storefront origin it succeeds.
12. **Unpublish**: unpublish a product that is in someone's cart → storefront
    list/detail 404 it, but the cart item still renders (fallback art) and is
    removable.
13. **Stale cart**: with a pre-cutover localStorage (redux-persist version <2)
    → app loads without crash, cart is empty (migration purge). With a v2
    cart (polos without `cut`) → items are kept and show `Corte: Hombre`.
14. **Libro de Reclamaciones**: `store.<domain>/libro-de-reclamaciones` →
    submit with an invalid field → inline error, no 429 even after several
    tries (400s do not consume the rate limit); valid submission → screen
    shows `LR-YYYY-000001` (+ "te enviamos una copia" only with SMTP set).
    `admin.<domain>/complaints` lists it as *Nuevo*; open it → "Marcar
    atendido" flips the status. `GET api.<domain>/api/admin/complaints`
    without a token → 401.
