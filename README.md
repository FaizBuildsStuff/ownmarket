<div align="center">

## OwnMarket 2.0

Modern digital‑products marketplace built with **Next.js App Router**, **Prisma + Neon Postgres**, and a fully custom **auth + cart + chat** system.

</div>

---

## Stack

- **Runtime**: Next.js `app/` router, React 19
- **Styling**: Tailwind, shadcn/ui, GSAP animations
- **Database**: Prisma 7 + Neon Postgres
- **Auth**: Custom email/password auth (no NextAuth)  
  - `User`, `Session`, `Account`, `VerificationToken`
- **Marketplace models**:
  - `Product`, `Purchase`
- **Chat models**:
  - `ChatThread` (buyer ↔ seller per product, status: `OPEN | IN_PROGRESS | CLOSED`)
  - `ChatMessage`

---

## Features

### Auth
- Email/password signup and signin against Neon via Prisma.
- Sessions stored in `Session` table + `om_session` HTTP‑only cookie.
- Middleware:
  - Redirects logged‑in users away from `/signin` and `/signup` to `/dashboard`.
  - Protects `/dashboard` (redirects unauthenticated users to `/signin`).

### Roles
- `User.role` enum: `ADMIN`, `SELLER`, `BUYER`.
- Behavior:
  - **Buyer**: library‑style dashboard, purchases UI.
  - **Seller**: “Seller Studio” dashboard (create + manage products).
  - **Admin**: same as seller plus elevated permissions in APIs.

### Marketplace
- Landing marketplace section (`components/marketplace`) and full page (`/(root)/marketplace/page.tsx`) both read from the **`Product`** table:
  - `GET /api/products` returns all products with seller info.
  - `GET /api/products?mine=1` returns the logged‑in seller’s products.
- Product detail:
  - `/(products)/product/[id]/page.tsx` shows product hero, pricing, specs, description, and seller card.
  - `/(root)/product/[id]/page.tsx` is a simpler server version used by the public marketplace.

### Cart
- Global cart state in `app/context/CartContext.tsx`:
  - Items: `{ id, title, price, image, category, sellerId?, sellerName? }`.
  - Persisted to `localStorage` under `ownmarket_cart`.
- `CartDrawer` component:
  - Triggered from the main `Header`.
  - Shows live item count, subtotal, total.
  - Remove item and clear cart actions.
- Product page integration:
  - `ProductPurchaseActions` uses `useCart` to add the current product into the cart on “Buy Asset”.

### Chat (Buyer ↔ Seller)
- Prisma models:
  - `ChatThread`: links `buyerId`, `sellerId`, `productId`, `status`.
  - `ChatMessage`: messages within a thread.
- REST API:
  - `POST /api/chat/start` – start or reopen chat for `(buyer, seller, product)`.
  - `GET /api/chat/messages?threadId=...` – fetch messages + thread status.
  - `POST /api/chat/message` – send message in a thread.
  - `POST /api/chat/status` – change status (`OPEN`, `IN_PROGRESS`, `CLOSED`) with role checks:
    - Seller/Admin can mark `IN_PROGRESS` (start order).
    - Buyer can mark `CLOSED` (got the product / close chat).
- UI:
  - `ChatWidget` (bottom‑right floating chat):
    - Used on the product page and in `CartDrawer` for each cart item.
    - Polls messages every few seconds for “realtime” feel.
    - Buyer and seller share a single thread per product.

### Dashboards
- `/(dashboard)/dashboard/page.tsx`:
  - Fetches `/api/auth/me` and role‑gates content.
  - **Seller view**:
    - Stats: active products, role badge, drafts.
    - Product creation form → `POST /api/products`.
    - Product list with **View** (`/product/[id]`) and **Delete** (AlertDialog + `DELETE /api/products/[id]`).
  - **Buyer view**:
    - Library cards using mock purchases (can be wired to `Purchase` later).

### Admin/Seller Header
- `components/adminheader.tsx`:
  - Used as layout header for all `/(dashboard)` routes.
  - Shows:
    - Breadcrumbs for the current dashboard route.
    - Search input.
    - Notification bell.
    - User avatar + role badge.
    - **Seller chat inbox icon** for `SELLER`/`ADMIN` roles (currently routes to the seller inbox entry point).

---

## API Overview

- **Auth**
  - `POST /api/auth/signup`
  - `POST /api/auth/signin`
  - `GET /api/auth/me`
  - `POST /api/auth/signout`
- **Products**
  - `GET /api/products`
  - `GET /api/products?mine=1`
  - `GET /api/products/[id]`
  - `PATCH /api/products/[id]`
  - `DELETE /api/products/[id]`
- **Users**
  - `GET /api/users/[id]` – public seller profile + their products.
- **Chat**
  - `POST /api/chat/start`
  - `GET /api/chat/messages?threadId=...`
  - `POST /api/chat/message`
  - `POST /api/chat/status`

---

## Local Development

```bash
# Install deps
npm install

# Prisma
npx prisma generate
npx prisma db push

# Run dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Notes

- Database connection string is configured via `DATABASE_URL` in `.env` and wired through `prisma.config.ts`.
- Auth, cart, and chat all rely on the logged‑in user from `/api/auth/me`. Make sure you are signed in before trying seller features or chat.

