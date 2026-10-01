"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { CART_KEY, lineCount, subtotalCents, type CartLine } from "@/lib/cart";

/* ------------------------------------------------------------------ *
 * A tiny external store backed by localStorage.
 *
 * Using useSyncExternalStore (rather than setState inside an effect)
 * means the cart is read as external state, so there is no cascading
 * render and no hydration mismatch: the server always sees an empty
 * cart, the client reads storage on its first render.
 * ------------------------------------------------------------------ */

const EMPTY: CartLine[] = [];

let snapshot: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      snapshot = parsed.filter(
        (l): l is CartLine =>
          !!l && typeof l === "object" && typeof l.variantId === "string"
      );
    }
  } catch {
    // corrupt or unreadable storage — start from an empty bag
    snapshot = EMPTY;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== null && e.key !== CART_KEY) return;
    loaded = false;
    load();
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return snapshot;
}

function getServerSnapshot() {
  return EMPTY;
}

function setLines(next: CartLine[]) {
  snapshot = next;
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(next));
  } catch {
    // storage blocked or full — the cart still works for this session
  }
  emit();
}

/** Applies a pure update and notifies subscribers. */
function updateLines(recipe: (prev: CartLine[]) => CartLine[]) {
  setLines(recipe(snapshot));
}

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // false during the server render and the first client render, true after —
  // lets the UI avoid flashing an empty bag before storage has been read.
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const add = useCallback((line: Omit<CartLine, "quantity">, quantity = 1) => {
    updateLines((prev) => {
      const i = prev.findIndex((l) => l.variantId === line.variantId);
      if (i === -1) {
        return [...prev, { ...line, quantity: Math.max(1, Math.min(quantity, line.stock || 99)) }];
      }
      const next = [...prev];
      const cap = next[i].stock || 99;
      next[i] = { ...next[i], quantity: Math.min(next[i].quantity + quantity, cap) };
      return next;
    });
  }, []);

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    updateLines((prev) =>
      prev
        .map((l) =>
          l.variantId === variantId
            ? { ...l, quantity: Math.max(0, Math.min(quantity, l.stock || 99)) }
            : l
        )
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const remove = useCallback((variantId: string) => {
    updateLines((prev) => prev.filter((l) => l.variantId !== variantId));
  }, []);

  const clear = useCallback(() => setLines(EMPTY), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      ready,
      count: lineCount(lines),
      subtotal: subtotalCents(lines),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, ready, add, setQuantity, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
