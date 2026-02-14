"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getCart,
  setCart,
  addToCart as addToCartStorage,
  removeFromCart as removeFromCartStorage,
  setCartQuantity as setCartQuantityStorage,
  getCartItemCount,
  type CartMap,
} from "@/lib/cart";

type CartContextValue = {
  items: CartMap;
  itemCount: number;
  addItem: (productId: string, quantity?: number, maxQty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number, maxQty?: number) => void;
  setItems: (items: CartMap) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItemsState] = useState<CartMap>({});

  useEffect(() => {
    setItemsState(getCart());
  }, []);

  const setItems = useCallback((next: CartMap) => {
    setCart(next);
    setItemsState(next);
  }, []);

  const addItem = useCallback(
    (productId: string, quantity: number = 1, maxQty: number = 999) => {
      const next = addToCartStorage(productId, quantity, maxQty);
      setItemsState(next);
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    const next = removeFromCartStorage(productId);
    setItemsState(next);
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, maxQty: number = 999) => {
      const next = setCartQuantityStorage(productId, quantity, maxQty);
      setItemsState(next);
    },
    []
  );

  const itemCount = getCartItemCount(items);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        setItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
