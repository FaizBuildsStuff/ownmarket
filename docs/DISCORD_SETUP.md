# Discord Developer Application & Bot Setup

Follow these steps to set up Discord OAuth so sellers can **Connect Discord** from the dashboard and buyers can see real Discord profiles and use **Contact on Discord**.

---

## 1. Create a Discord Application

1. Go to **[Discord Developer Portal](https://discord.com/developers/applications)** and sign in.
2. Click **New Application**.
3. Name it (e.g. `OwnMarket`) and click **Create**.

---

## 2. Get OAuth2 Credentials

1. In the left sidebar, open **OAuth2** → **General**.
2. Copy the **Client ID** → save as `DISCORD_CLIENT_ID` in `.env`.
3. Under **Client Secret**, click **Reset Secret** (if needed), then **Copy** → save as `DISCORD_CLIENT_SECRET` in `.env`.  
   **Never commit this to git or expose it in the frontend.**

---

## 3. Set Redirect URL

1. Still under **OAuth2** → **General**, find **Redirects**.
2. Click **Add Redirect**.
3. Add:
   - Local: `http://localhost:3000/api/auth/discord/callback`
   - Production: `https://yourdomain.com/api/auth/discord/callback`
4. Click **Save Changes**.

---

## 4. Configure OAuth2 URL (optional)

1. Under **OAuth2** → **URL Generator** you can build the auth URL for testing.
2. Scopes: tick **identify** (so we get id, username, avatar).
3. The app uses **authorization code** flow; the redirect is handled by the app.

---

## 5. Environment Variables

Add to `.env` (and to your host’s env for production):

```env
# Discord OAuth (from Developer Portal → OAuth2 → General)
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here

# App URL (used for redirect_uri)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Production: https://yourdomain.com

# Supabase (for updating profile after Discord connect)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

- **SUPABASE_SERVICE_ROLE_KEY**: Supabase Dashboard → **Settings** → **API** → **Project API keys** → **service_role** (secret).  
  Used only in the Discord callback API route to update `profiles` (discord_id, discord_username, discord_avatar).  
  **Never expose this in the frontend.**

---

## 6. Database: Discord Columns

If you created `profiles` before adding Discord fields, run in Supabase **SQL Editor**:

```sql
alter table public.profiles add column if not exists discord_id text;
alter table public.profiles add column if not exists discord_username text;
alter table public.profiles add column if not exists discord_avatar text;
```

(The main `schema.sql` already defines these columns for new installs.)

---

## 7. Flow Summary

1. **Seller** clicks **Connect Discord** on the dashboard → redirects to Discord → user authorizes.
2. Discord redirects to `/api/auth/discord/callback` with `code` and `state`.
3. App exchanges `code` for an access token, fetches Discord user (id, username, avatar).
4. App updates `profiles` for that user with `discord_id`, `discord_username`, `discord_avatar` (using service role so the callback can write to the profile).
5. Product and user pages show the Discord avatar and **Contact on Discord** (link to `https://discord.com/users/{discord_id}`).

---

## 8. Optional: Bot for Your Server

If you want a **bot** in your Discord server (e.g. for slash commands or DMs):

1. In the Developer Portal, open **Bot** in the left sidebar.
2. Click **Add Bot**.
3. Copy the **Token** → store as `DISCORD_BOT_TOKEN` (only if you add bot features later).
4. Under **OAuth2** → **URL Generator**, select scopes **bot** and permissions you need, then use the generated URL to invite the bot to your server.

For **Connect Discord** (seller profile linking) you only need the **OAuth2 application** (Client ID + Client Secret + redirect); a bot is optional.

---

## 9. Troubleshooting

| Issue | Check |
|--------|--------|
| Redirect URI mismatch | Redirect in Discord must match exactly (including `/api/auth/discord/callback` and http vs https). |
| "Invalid state" | Same `DISCORD_CLIENT_SECRET` in env as in Discord; server restarted after changing env. |
| Profile not updating | `SUPABASE_SERVICE_ROLE_KEY` set and correct; RLS allows service role to update `profiles`. |
| Avatar not loading | `discord_avatar` can be null for users with no avatar; we use `discord_id` + `discord_avatar` for CDN URL. |
