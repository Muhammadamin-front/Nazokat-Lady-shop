"use client";

import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";

export type Line = { id: string; color: number; size: string; qty: number };
export type Profile = { name: string; phone: string; address: string; note: string };

type State = {
  ready: boolean;
  cart: Line[];
  favs: string[];
  seen: string[]; // ko'rilgan story'lar
  profile: Profile;
};

type Action =
  | { type: "hydrate"; state: Partial<State> }
  | { type: "add"; line: Line }
  | { type: "qty"; key: string; delta: number }
  | { type: "remove"; key: string }
  | { type: "clear" }
  | { type: "fav"; id: string }
  | { type: "seen"; id: string }
  | { type: "profile"; profile: Profile };

export const lineKey = (l: Pick<Line, "id" | "color" | "size">) => `${l.id}|${l.color}|${l.size}`;

const initial: State = {
  ready: false,
  cart: [],
  favs: [],
  seen: [],
  profile: { name: "", phone: "", address: "", note: "" },
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "hydrate":
      return { ...s, ...a.state, ready: true };
    case "add": {
      const k = lineKey(a.line);
      const has = s.cart.some((l) => lineKey(l) === k);
      return {
        ...s,
        cart: has
          ? s.cart.map((l) => (lineKey(l) === k ? { ...l, qty: Math.min(20, l.qty + a.line.qty) } : l))
          : [...s.cart, a.line],
      };
    }
    case "qty":
      return {
        ...s,
        cart: s.cart
          .map((l) => (lineKey(l) === a.key ? { ...l, qty: Math.min(20, l.qty + a.delta) } : l))
          .filter((l) => l.qty > 0),
      };
    case "remove":
      return { ...s, cart: s.cart.filter((l) => lineKey(l) !== a.key) };
    case "clear":
      return { ...s, cart: [] };
    case "fav":
      return { ...s, favs: s.favs.includes(a.id) ? s.favs.filter((x) => x !== a.id) : [...s.favs, a.id] };
    case "seen":
      return s.seen.includes(a.id) ? s : { ...s, seen: [...s.seen, a.id] };
    case "profile":
      return { ...s, profile: a.profile };
  }
}

const KEY = "nazokat:v2";
const Ctx = createContext<{ state: State; dispatch: (a: Action) => void } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      dispatch({ type: "hydrate", state: saved });
    } catch {
      dispatch({ type: "hydrate", state: {} });
    }
  }, []);

  useEffect(() => {
    if (!state.ready) return;
    try {
      const { cart, favs, seen, profile } = state;
      localStorage.setItem(KEY, JSON.stringify({ cart, favs, seen, profile }));
    } catch {}
  }, [state]);

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be inside StoreProvider");
  return v;
}

export const cartCount = (cart: Line[]) => cart.reduce((n, l) => n + l.qty, 0);
