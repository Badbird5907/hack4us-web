"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

interface NavbarSlotContextValue {
  setContent: (content: ReactNode) => void;
  clearContent: () => void;
  content: ReactNode;
}

const NavbarSlotContext = createContext<NavbarSlotContextValue | null>(null);

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

export function NavbarSlotOutlet() {
  const ctx = useContext(NavbarSlotContext);
  if (!ctx?.content) return null;
  return <>{ctx.content}</>;
}

export function useNavbarSlot() {
  const ctx = useContext(NavbarSlotContext);
  if (!ctx) throw new Error("useNavbarSlot must be used within NavbarSlotProvider");
  return { setContent: ctx.setContent, clearContent: ctx.clearContent };
}

export function NavbarSlot({ children }: { children: ReactNode }) {
  const { setContent, clearContent } = useNavbarSlot();

  useEffect(() => {
    setContent(children);
    return () => clearContent();
  }, [children, setContent, clearContent]);

  return null;
}
