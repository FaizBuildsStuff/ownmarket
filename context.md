## OwnMarket 2.0 – Architecture & Context

### High‑Level Concept

OwnMarket is a digital products marketplace where:

- **Buyers** browse marketplace listings, maintain a cart, purchase assets, and chat with sellers about specific products.
- **Sellers** publish and manage products, receive and respond to buyer chats, and handle simple “order” flows (open → in progress → closed).
- **Admins** have the same UI as sellers but with elevated permissions inside APIs.

All of this is implemented on top of:

- Next.js App Router (`app/`)
- Prisma 7 + Neon Postgres
- Tailwind + shadcn/ui + GSAP

---

### Data Model (Prisma)

Core models in `prisma/schema.prisma`:

- `User`
  - Fields: `id`, `name`, `email`, `image`, `passwordHash`, `role` (`ADMIN | SELLER | BUYER`), etc.
  - Relations:
    - `accounts`, `sessions` (for auth)
    - `purchases`, `products`
    - `buyerChats`, `sellerChats`, `chatMessages`

- `Session`, `Account`, `VerificationToken`
  - Support for the custom auth/session system.

- `Product`
  - `id`, `title`, `description`, `price`, `category`, `image`, `version`, `rating`, `createdAt`
  - `sellerId` → `User`
  - `purchases` → `Purchase[]`
  - `chatThreads` → `ChatThread[]`

- `Purchase`
  - Records a buyer’s purchase of a product with `pricePaid`, `licenseKey`, timestamps.

- `ChatThread`
  - `buyerId`, `sellerId`, `productId`
  - `status`: `OPEN | IN_PROGRESS | CLOSED`
  - Relations to `buyer`, `seller`, `product`, `messages`

- `ChatMessage`
  - `threadId`, `senderId`, `content`, `createdAt`
  - Links to `ChatThread` and `User` (`sender`).

---

### Auth Flow

- **Sign up**: `POST /api/auth/signup`
  - Creates `User` with `passwordHash` (Node crypto `scrypt`), default role `BUYER`.
  - Creates `Session` row + sets `om_session` cookie.

- **Sign in**: `POST /api/auth/signin`
  - Verifies email/password against `passwordHash`.
  - Creates `Session` + `om_session` cookie.

- **Current user**: `GET /api/auth/me`
  - Uses `cookies()` + Prisma `Session` to find the user for `om_session` token.

- **Sign out**: `POST /api/auth/signout`
  - Deletes session row(s) and clears the cookie.

`middleware.ts`:

- Redirects logged‑in users away from `/signin` and `/signup` → `/dashboard`.
- Protects `/dashboard/:path*` by redirecting unauthenticated users → `/signin`.

---

### Roles & Dashboards

`User.role` controls dashboard behavior:

- **BUYER**
  - `/(dashboard)/dashboard/page.tsx` shows a library UI (`purchases` mock data today; can be wired to `Purchase` later).
  - Future: buyer stats such as total spent this month, recent chats, recent purchases.

- **SELLER**
  - “Seller Studio” dashboard:
    - Top stats: active products, role, drafts.
    - Product creation form (title, price, category, image, description) → `POST /api/products`.
    - Product list (from `GET /api/products?mine=1`) with **View** and **Delete**:
      - View → `/product/[id]`.
      - Delete uses shadcn `AlertDialog` + `DELETE /api/products/[id]`.

- **ADMIN**
  - Same UI as seller, but APIs (`/api/products`, `/api/products/[id]`, chat) treat admin as elevated (e.g. can update/delete any product, start chats as seller, etc.).

`components/adminheader.tsx` is the header for all `/(dashboard)` routes and includes:

- Breadcrumbs based on the current pathname.
- Search input.
- Notification bell.
- User identity (avatar, email, role).
- For `SELLER`/`ADMIN`: a **chat inbox icon** to jump into the seller messages experience.

---

### Marketplace & Products

#### Listing

- Landing “Marketplace” section (`components/marketplace.tsx`) and the full marketplace page (`/(root)/marketplace/page.tsx`) both call `GET /api/products`:
  - Endpoint returns products ordered by `createdAt desc` with seller info.
  - Frontend maps DB products to UI cards (title, price, category, rating, image, seller name).

#### Product Detail

There are two product pages:

- `/(products)/product/[id]/page.tsx` – premium product canvas used from authenticated flows.
- `/(root)/product/[id]/page.tsx` – simpler server version for public marketplace.

Both:

- Fetch product via Prisma with `seller` relation.
- Show large hero image, category badge, title, price, version and other meta.
- Show a seller card with a link to `/user/[sellerId]`.

`/(root)/user/[id]/page.tsx`:

- Shows seller profile (name, email, role).
- Lists all products for that seller with price and links back to each product page.

---

### Cart Flow

- Global state is provided by `CartProvider` in `app/layout.tsx`.

`CartContext`:

- `cart: Product[]` where each product is `{ id, title, price, image, category, sellerId?, sellerName? }`.
- `addToCart`, `removeFromCart`, `clearCart`.
- Persists to `localStorage` with key `ownmarket_cart`.

`components/CartDrawer.tsx`:

- Triggered from the main site header (top right).
- Shows a count badge, list of current cart items, and totals.
- Removal and simple quantity “1” UI.
- For items with `sellerId`, renders a `ChatWidget` to open chat with that seller for that product.

`ProductPurchaseActions`:

- Used on `/(products)/product/[id]/page.tsx`.
- Left button: `ChatWidget` for the product + seller.
- Right button: “Buy Asset“ – adds the product into the cart via `useCart`.

---

### Chat System

Goal: lightweight buyer ↔ seller messaging scoped to a product with a very simple order flow.

#### Data

- `ChatThread`
  - Buyer, seller, product, status (`OPEN`, `IN_PROGRESS`, `CLOSED`).
  - Array of `ChatMessage`s.
- `ChatMessage`
  - Thread, sender, content, createdAt.

#### Endpoints

- `POST /api/chat/start`
  - Body: `{ productId }`.
  - Gets current user = **buyer**, product, and seller from DB.
  - Finds an existing thread for `(buyerId, sellerId, productId, status in [OPEN, IN_PROGRESS])` or creates one.
  - Returns thread, initial messages, and the current user identity (`id` + `role`).

- `GET /api/chat/messages?threadId=...`
  - Validates that current user is buyer or seller on the thread.
  - Returns thread + ordered messages.

- `POST /api/chat/message`
  - Body: `{ threadId, content }`.
  - Validates thread membership and `status !== CLOSED`.
  - Creates `ChatMessage`, returns single mapped message for the UI to append.

- `POST /api/chat/status`
  - Body: `{ threadId, status }`.
  - Validates thread and membership.
  - Rules:
    - Only seller/admin can set `IN_PROGRESS` (start order).
    - Only buyer can set `CLOSED` (once they “got it”).
  - Returns updated thread.

#### UI Components

- `ChatWidget`
  - Client component responsible for the floating bottom‑right chat experience.
  - Props: `{ productId, sellerId, sellerName? }`.
  - Behavior:
    - On first open: calls `/api/chat/start`.
    - Starts a polling loop (every ~3s) to `/api/chat/messages?threadId=...`.
    - Renders messages as left/right bubbles depending on sender.
    - Provides an input + send button (`/api/chat/message`).
    - Shows status badge and role‑aware actions (“Start order”, “Mark as received & close”).  

Integration points:

- Product detail (`ProductPurchaseActions`): buyer can start chat + add to cart.
- Cart items (`CartDrawer`) when `sellerId` is present: buyer can reopen chat per item.
- AdminHeader: seller chat icon (`MessageSquare`) links to the **seller inbox** page at `/dashboard/messages`.

#### Seller Inbox

- Route: `/(dashboard)/messages/page.tsx`.
- Data: uses `GET /api/chat/threads` to fetch all threads where the user is buyer or seller.
- UI:
  - Left sidebar groups threads into **Pending**, **In progress**, **Closed** and sorts them by `updatedAt desc`.
  - Each item shows buyer name/email, product title, last‑message snippet, and a status pill.
  - Right panel shows the full conversation and uses the same chat APIs (`/messages`, `/message`, `/status`) with polling for near‑realtime updates.

---

### Future Improvements (Planned)

- **Buyer dashboard enhancements**:
  - Real purchases wired to `Purchase` model.
  - “This month’s spend”, “Recent messages”, and “Recent activity” cards.
  - Show current cart snapshot and quick links to open chats with sellers they’re currently talking to.

- **Admin‑only dashboard widgets**:
  - Platform‑wide stats: total products, total sales, top sellers.
  - Controls for moderating products and users.

