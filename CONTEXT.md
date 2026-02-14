# OwnMarket — Project Context

This file gives developers and AI assistants enough context to work on the codebase without guessing. Update it when you add major features or change architecture.

---

## What OwnMarket Is

OwnMarket is a **Discord-centric marketplace** for buying and selling:

- Discord Nitro (keys, gifts)
- Server boosts
- OG / vanity usernames
- Related perks (server slots, etc.)

**Important:** The site does **not** process payments. Buyers add items to a **cart**, then **contact each seller on Discord** (DM or server) to complete the trade. Escrow and payment happen off-site (Discord, agreed methods). The app’s job is: **discovery, profiles, cart, and links to Discord**.

---

## Tech Stack (Summary)

- **Next.js 16** — App Router, React 19, server and client components.
- **Supabase** — Auth (email/password), Postgres, RLS. No separate backend service.
- **Tailwind CSS 4** — Styling. Some shadcn-style components (Radix-based).
- **Framer Motion** — Page and card animations.
- **Cart** — Stored in **localStorage**; React context (`CartContext`) syncs UI. No DB table for cart.
- **Font** — Roboto Condensed (variable), loaded via `next/font`.

---

## Key Paths and Conventions

- **Layout & shell:** `app/layout.tsx` — metadata, viewport, `CartProvider`, Header, main, Footer.
- **Auth state:** Supabase `auth.getUser()` + `profiles.role`; optional localStorage key `ownmarket-auth` for quick hydrate before Supabase resolves.
- **Roles:** `profiles.role` = `'admin' | 'buyer' | 'seller'`. Dashboard and RLS depend on it.
- **Discord OAuth:** `/api/auth/discord` (redirect to Discord) and `/api/auth/discord/callback` (exchange code, update `profiles.discord_id`, `discord_username`, `discord_avatar`). Uses **service role** in callback to update any profile row.
- **Contact form:** POST `/api/contact` → validates body → inserts into `contact_requests` (Supabase, service role). No public RLS insert.
- **Admin actions:** Done from the client with the **anon key**; RLS policies allow `role = 'admin'` to update/delete products and update profiles (ban, timeout, badge).

---

## Data Model (Supabase)

- **profiles** — One per auth user. Fields: `id` (auth.users.id), `username`, `discord_handle`, `discord_id`, `discord_username`, `discord_avatar`, `role`, `badge`, `banned`, `banned_until`, `created_at`. RLS: own profile + public read; admin can update any.
- **products** — Listings. Fields: `id`, `seller_id`, `name`, `price`, `quantity`, `description`, `discord_channel_link`, `badge`, `created_at`. RLS: public read; seller CRUD own; admin update/delete any.
- **contact_requests** — Contact form. Fields: `id`, `name`, `email`, `subject`, `message`, `created_at`. RLS: only admin read; inserts via API (service role).

Cart is **not** in the DB; it’s in `lib/cart.ts` + `context/CartContext.tsx` (localStorage key `ownmarket-cart`).

---

## Auth and Roles

- **Sign up / Log in** — Header dialog; Supabase email/password; profile upserted with `username`, `discord_handle` (signup). Role comes from `profiles.role` (default `'buyer'`).
- **Dashboard** — Redirects to `/` if not logged in. Renders different UIs:
  - **Buyer:** Cart summary, quick actions (marketplace, safety, Discord, support), “How buying works,” optional Discord connect.
  - **Seller:** Create product form, list own products (edit, delete, badge), Connect Discord card.
  - **Admin:** List all products (edit, delete, badge), list all users (ban, timeout, badge, unban).
- **Banned / timeout:** `profiles.banned` or `banned_until > now()`; product and user pages show “restricted” state; admins can unban or clear timeout.

---

## Cart and Checkout (Concept)

- **Add to cart** — Product page and listing cards (marketplace, home). Stored as `{ [productId]: quantity }` in localStorage; quantity capped by product’s `quantity`.
- **Cart page** — Reads cart, fetches product + seller profiles, **groups by seller**. Per-seller block: seller name (link to profile), “Contact this seller” (Discord DM if `discord_id`), list of items with qty controls and remove. Bottom: total, “Open OwnMarket Discord,” “Keep shopping.”
- **No checkout or payment** — “Contact sellers on Discord” is the CTA.

---

## Environment Variables (Reference)

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (client).
- `SUPABASE_SERVICE_ROLE_KEY` — Server-only (Discord callback, contact API).
- `NEXT_PUBLIC_APP_URL` — App origin (OAuth redirects, canonical, OG).
- `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` — Discord OAuth app.

Never commit real keys; use `.env.example` with placeholders.

---

## UI and Theming

- Single theme: light, white/zinc. No dark mode toggle in code.
- Header: responsive; hamburger + slide-out menu on small screens; cart icon with count; auth buttons or Dashboard/Logout.
- Footer: Marketplace (listings, cart), Safety & support (safety, support, contact, Discord), quick links, Terms/Privacy/Support/Discord (links).

---

## SEO and Branding

- **Metadata** — Set in `app/layout.tsx`: title template, description, keywords, Open Graph, Twitter card, robots, canonical (from `NEXT_PUBLIC_APP_URL`), icons, manifest.
- **Viewport** — `themeColor`, width, scale in `viewport` export.
- **JSON-LD** — WebSite + SearchAction (marketplace) in layout body.
- **Assets** — Expects `public/favicon.ico`, `public/og.png` (1200×630), `public/apple-touch-icon.png`, `public/manifest.json` (in repo).

---

## Common Tasks (Where to Look)

- **Change site title or meta:** `app/layout.tsx` → `metadata` and `viewport`.
- **Change role-based dashboard:** `app/dashboard/page.tsx` (buyer / seller / admin blocks).
- **Change cart logic:** `lib/cart.ts`, `context/CartContext.tsx`, `app/cart/page.tsx`.
- **Add a new API route:** `app/api/<name>/route.ts`; use service role only when RLS must be bypassed.
- **Add DB table or RLS:** `supabase/schema.sql` (and migrations if you use them).
- **Discord OAuth flow:** `app/api/auth/discord/route.ts`, `app/api/auth/discord/callback/route.ts`; setup guide: `docs/DISCORD_SETUP.md`.

---

*Keep this file updated when you add major features or change how auth, cart, or roles work.*
