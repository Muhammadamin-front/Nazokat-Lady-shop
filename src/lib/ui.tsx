"use client";

import { createContext, useContext } from "react";

export type Tab = "home" | "favs" | "cart" | "info";
export type ToastAction = { label: string; onClick: () => void };

export type UI = {
  go: (tab: Tab) => void;
  openProduct: (id: string, color?: number, replace?: boolean) => void;
  openStory: (index: number) => void;
  openReels: (index: number) => void;
  toast: (msg: string, action?: ToastAction) => void;
};

export const UIContext = createContext<UI | null>(null);

export function useUI() {
  const v = useContext(UIContext);
  if (!v) throw new Error("useUI must be inside UIContext");
  return v;
}
