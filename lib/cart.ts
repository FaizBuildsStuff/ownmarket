/**
 * Cart stored in localStorage. Shape: { [productId]: quantity }
 * No backend — works for guests and logged-in users; trades happen via Discord.
 */

const CART_KEY = "ownmarket-cart";

export type CartMap = Record<string, number>;

export function getCart(): CartMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const out: CartMap = {};
      for (const [k, v] of Object.entries(parsed)) {
        const q = typeof v === "number" && Number.isInteger(v) && v > 0 ? v : 1;
        if (q > 0) out[k] = q;
      }
      return out;
    }
  } catch {
    // ignore
  }
  return {};
}

export function setCart(items: CartMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function addToCart(productId: string, quantity: number = 1, maxQty: number = 999): CartMap {
  const cart = getCart();
  const current = cart[productId] ?? 0;
  const next = Math.min(maxQty, Math.max(0, current + quantity));
  if (next <= 0) {
    const { [productId]: _, ...rest } = cart;
    setCart(rest);
    return rest;
  }
  const nextCart = { ...cart, [productId]: next };
  setCart(nextCart);
  return nextCart;
}

export function removeFromCart(productId: string): CartMap {
  const cart = getCart();
  const { [productId]: _, ...rest } = cart;
  setCart(rest);
  return rest;
}

export function setCartQuantity(productId: string, quantity: number, maxQty: number = 999): CartMap {
  const q = Math.min(maxQty, Math.max(0, Math.floor(quantity)));
  const cart = getCart();
  if (q <= 0) {
    const { [productId]: __, ...rest } = cart;
    setCart(rest);
    return rest;
  }
  const nextCart = { ...cart, [productId]: q };
  setCart(nextCart);
  return nextCart;
}

export function getCartItemCount(items: CartMap): number {
  return Object.values(items).reduce((sum, q) => sum + q, 0);
}
