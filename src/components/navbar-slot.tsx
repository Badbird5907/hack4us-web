"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface NavbarSlotContextValue {
  setContent: (content: ReactNode) => void;
  clearContent: () => void;
  content: ReactNode;
}

const NavbarSlotContext = createContext<NavbarSlotContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider — wrap the authenticated layout shell with this
// ---------------------------------------------------------------------------

export function NavbarSlotProvider({ children }: { children: ReactNode }) {
  const [content, setContentState] = useState<ReactNode>(null);

  const setContent = useCallback((node: ReactNode) => {
    setContentState(node);
  }, []);

  const clearContent = useCallback(() => {
    setContentState(null);
  }, []);

  return (
    <NavbarSlotContext.Provider value={{ content, setContent, clearContent }}>
      {children}
    </NavbarSlotContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Outlet — place this inside the <header> where content should appear
// ---------------------------------------------------------------------------

export function NavbarSlotOutlet() {
  const ctx = useContext(NavbarSlotContext);
  if (!ctx?.content) return null;
  return <>{ctx.content}</>;
}

// ---------------------------------------------------------------------------
// Hook — call this from any client page to push content into the navbar
// ---------------------------------------------------------------------------

export function useNavbarSlot() {
  const ctx = useContext(NavbarSlotContext);
  if (!ctx) throw new Error("useNavbarSlot must be used within NavbarSlotProvider");
  return { setContent: ctx.setContent, clearContent: ctx.clearContent };
}
