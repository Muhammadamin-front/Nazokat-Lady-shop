"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Catalog } from "./types";

const Ctx = createContext<Catalog | null>(null);

export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: ReactNode }) {
  return <Ctx.Provider value={catalog}>{children}</Ctx.Provider>;
}

export function useCatalog() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCatalog must be inside CatalogProvider");
  return c;
}
