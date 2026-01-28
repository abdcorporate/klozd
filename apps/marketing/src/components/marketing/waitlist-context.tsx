"use client";

import { createContext, useContext, useState, useRef, ReactNode } from "react";

interface WaitlistContextType {
  isOpen: boolean;
  openWaitlist: () => void;
  closeWaitlist: () => void;
}

const WaitlistContext = createContext<WaitlistContextType | undefined>(undefined);

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openWaitlist = () => {
    triggerRef.current = (document.activeElement as HTMLElement) || null;
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeWaitlist = () => {
    setIsOpen(false);
    document.body.style.overflow = "";
    requestAnimationFrame(() => {
      if (triggerRef.current && typeof triggerRef.current.focus === "function") {
        triggerRef.current.focus();
      }
      triggerRef.current = null;
    });
  };

  return (
    <WaitlistContext.Provider value={{ isOpen, openWaitlist, closeWaitlist }}>
      {children}
    </WaitlistContext.Provider>
  );
}

export function useWaitlist() {
  const context = useContext(WaitlistContext);
  if (context === undefined) {
    throw new Error("useWaitlist must be used within a WaitlistProvider");
  }
  return context;
}
