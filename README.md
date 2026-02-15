# OwnMarket

**Discord marketplace for Nitro, server boosts, OG usernames, and vanity tags.**  
Verified sellers, escrow-first trading, and a single place to browse and contact sellers.

---

## Stack

| Layer        | Tech |
|-------------|------|
| Framework   | [Next.js](https://nextjs.org) 16 (App Router) |
| UI          | React 19, [Tailwind CSS](https://tailwindcss.com) 4, [Framer Motion](https://www.framer.com/motion), [Radix UI](https://www.radix-ui.com), [Lucide](https://lucide.dev) |
| Data        | [Supabase](https://supabase.com) (Auth + Postgres + RLS) |
| Font        | [Roboto Condensed](https://fonts.google.com/specimen/Roboto+Condensed) (variable) |

---

## Quick start

```bash
git clone <repo-url>
cd ownmarket
npm install
cp .env.example .env   # then fill in values
npm run dev
```

Open **http://localhost:3000**.

---

## Scripts

| Command        | Description |
|----------------|-------------|
| `npm run dev`  | Start dev server (hot reload) |
| `npm run build`| Production build |
| `npm run start`| Run production server |

---

## Environment

Create a `.env` (or copy from `.env.example`). Required:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only: Discord callback, contact API) |
| `NEXT_PUBLIC_APP_URL` | App origin (e.g. `https://ownmarket.shop` in production or `http://localhost:3000` locally) |
| `DISCORD_CLIENT_ID` | Discord OAuth app client ID |
| `DISCORD_CLIENT_SECRET` | Discord OAuth app client secret |

See [docs/DISCORD_SETUP.md](docs/DISCORD_SETUP.md) for Discord app setup.

---

## Project structure

```
ownmarket/
├── app/
│   ├── layout.tsx          # Root layout, metadata, CartProvider
│   ├── page.tsx            # Home (hero, featured products)
│   ├── marketplace/        # All listings
│   ├── products/[id]/      # Product detail
│   ├── users/[id]/         # User/seller profile
│   ├── cart/               # Cart (grouped by seller)
│   ├── dashboard/          # Role-based: buyer / seller / admin
│   ├── support/            # Support hub
│   ├── contact/            # Contact form
│   ├── safety/             # Safety & escrow
│   ├── perks/              # Perks info
│   ├── discord/            # Discord invite/redirect
│   └── api/
│       ├── auth/discord/   # OAuth flow
│       └── contact/        # Contact form submit → Supabase
├── components/             # Header, Footer, FAQs, Integrations, UI
├── context/                # CartContext (localStorage cart)
├── lib/                    # supabaseClient, cart helpers, utils
├── public/                 # Static assets, manifest.json
├── supabase/
│   └── schema.sql          # Profiles, products, contact_requests, RLS
└── docs/                   # DISCORD_SETUP.md, etc.
```

---

## Features

- **Roles:** `buyer` | `seller` | `admin` (stored in `profiles.role`).
- **Auth:** Email/password (Supabase) + optional Discord OAuth (link profile for marketplace display).
- **Cart:** Client-side cart (localStorage), grouped by seller; contact each seller on Discord.
- **Admin:** Manage all products (edit, delete, badge) and users (ban, timeout, badge).
- **Contact:** Form submissions stored in Supabase (`contact_requests`); admins can read.

---

## Database

Run [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL editor (or use migrations).  
Tables: `profiles`, `products`, `contact_requests`. RLS enforces per-role access.

---

## Deploy

- **Vercel:** Connect repo, set env vars, deploy. Set `NEXT_PUBLIC_APP_URL` to your production URL.
- **Else:** `npm run build && npm run start`; ensure Node 18+ and env are set.

---

## Docs

- [Discord app & OAuth](docs/DISCORD_SETUP.md)
- [CONTEXT.md](CONTEXT.md) — project context for contributors and AI assistants

---

## License

Private / All rights reserved.
