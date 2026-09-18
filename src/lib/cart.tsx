"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import {
  findItem,
  priceBreakdown,
  type PaymentMethod,
  type Localized,
} from "@/lib/menu";

/* ---------------------------------------------------------------
   The cart.

   Lines store only an id and a quantity. Names and prices are looked up
   from the menu on every render, so a price change in the menu can never
   leave a stale figure sitting in somebody's cart.
   --------------------------------------------------------------- */

const STORAGE_KEY = "pks.cart.v1";

export type CartLine = { id: string; quantity: number };

export type ResolvedLine = CartLine & {
  name: Localized;
  variant?: Localized;
  price: number;
  lineTotal: number;
};

type State = {
  lines: CartLine[];
  paymentMethod: PaymentMethod;
};

type Action =
  | { type: "add"; id: string; quantity?: number }
  | { type: "remove"; id: string }
  | { type: "setQuantity"; id: string; quantity: number }
  | { type: "setPaymentMethod"; method: PaymentMethod }
  | { type: "clear" }
  | { type: "hydrate"; state: State };

const MAX_PER_LINE = 50;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "add": {
      const quantity = action.quantity ?? 1;
      const existing = state.lines.find((line) => line.id === action.id);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((line) =>
            line.id === action.id
              ? { ...line, quantity: Math.min(MAX_PER_LINE, line.quantity + quantity) }
              : line,
          ),
        };
      }
      return { ...state, lines: [...state.lines, { id: action.id, quantity }] };
    }

    case "remove":
      return { ...state, lines: state.lines.filter((line) => line.id !== action.id) };

    case "setQuantity": {
      // Dropping to zero removes the line rather than leaving an empty row.
      if (action.quantity <= 0) {
        return { ...state, lines: state.lines.filter((line) => line.id !== action.id) };
      }
      return {
        ...state,
        lines: state.lines.map((line) =>
          line.id === action.id
            ? { ...line, quantity: Math.min(MAX_PER_LINE, action.quantity) }
            : line,
        ),
      };
    }

    case "setPaymentMethod":
      return { ...state, paymentMethod: action.method };

    case "clear":
      return { ...state, lines: [] };

    default:
      return state;
  }
}

const initialState: State = { lines: [], paymentMethod: "cod" };

type CartContextValue = {
  lines: ResolvedLine[];
  count: number;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  isOpen: boolean;
  hydrated: boolean;
  add: (id: string, quantity?: number) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  quantityOf: (id: string) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  /* Restore whatever was in the cart last visit. Reads happen after mount so
     the server and the first client render agree. */
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as State;
        // Drop anything whose menu item no longer exists.
        const lines = (parsed.lines ?? []).filter((line) => findItem(line.id));
        dispatch({
          type: "hydrate",
          state: {
            lines,
            paymentMethod: parsed.paymentMethod ?? "cod",
          },
        });
      }
    } catch {
      // A corrupt or blocked store is not worth breaking the page over.
    }
    // Storage can only be read after mount, so this second render is the
    // intended way to bring the saved cart in without a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Private browsing can refuse writes; the cart still works in memory.
    }
  }, [state, hydrated]);

  const lines = useMemo<ResolvedLine[]>(
    () =>
      state.lines.flatMap((line) => {
        const item = findItem(line.id);
        if (!item) return [];
        return [
          {
            ...line,
            name: item.name,
            variant: item.variant,
            price: item.price,
            lineTotal: item.price * line.quantity,
          },
        ];
      }),
    [state.lines],
  );

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.lineTotal, 0),
    [lines],
  );
  const count = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );
  const breakdown = useMemo(
    () => priceBreakdown(subtotal, state.paymentMethod),
    [subtotal, state.paymentMethod],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count,
      subtotal,
      taxRate: breakdown.rate,
      tax: breakdown.tax,
      total: breakdown.total,
      paymentMethod: state.paymentMethod,
      isOpen,
      hydrated,
      add: (id, quantity) => dispatch({ type: "add", id, quantity }),
      remove: (id) => dispatch({ type: "remove", id }),
      setQuantity: (id, quantity) => dispatch({ type: "setQuantity", id, quantity }),
      setPaymentMethod: (method) => dispatch({ type: "setPaymentMethod", method }),
      clear: () => dispatch({ type: "clear" }),
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      quantityOf: (id) =>
        state.lines.find((line) => line.id === id)?.quantity ?? 0,
    }),
    [lines, count, subtotal, breakdown, state.paymentMethod, state.lines, isOpen, hydrated],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}

/** Adds an item and opens the drawer — the usual "add to cart" behaviour. */
export function useAddToCart() {
  const { add, open } = useCart();
  return useCallback(
    (id: string, quantity = 1) => {
      add(id, quantity);
      open();
    },
    [add, open],
  );
}
