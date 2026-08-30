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

5. Visit `https://admin.<domain>` (login with `ADMIN_USER` + the plaintext
   password you hashed) and `https://store.<domain>`.

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
   23 already present (no dupes, no clobber).
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
8. **Storefront browse**: taza product page shows colors only (no sizes, no
   logo-position, no flip button) and is addable to cart with just a color;
   polo still demands size + logo position (error styling names the missing
   field).
9. **Like/unlike**: heart a product → count +1 (persists on reload); unheart
   → −1; a product at 0 never goes negative.
10. **Order**: cart with one polo (size+position) and one taza (color only) →
    confirm → WhatsApp message lists `M / #hex / pecho` for the polo, only
    the color for the taza, never "undefined"; order code is the server's
    8-char id; total matches server recomputation.
11. **CORS**: from a browser console on some other origin,
    `fetch('https://api.<domain>/api/products')` is blocked (no ACAO header);
    from the storefront origin it succeeds.
12. **Unpublish**: unpublish a product that is in someone's cart → storefront
    list/detail 404 it, but the cart item still renders (fallback art) and is
    removable.
13. **Stale cart**: with a pre-cutover localStorage (redux-persist version <2)
    → app loads without crash, cart is empty (migration purge).
