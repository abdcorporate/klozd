"use client";

import { useEffect } from "react";
import { useWaitlist } from "./waitlist-context";

/**
 * Ce composant écoute les événements et les clics sur les liens "#waitlist"
 * pour ouvrir automatiquement la popup de waitlist
 */
export function WaitlistTrigger() {
  const { openWaitlist } = useWaitlist();

  useEffect(() => {
    // Écouter les clics sur les liens avec href="#waitlist"
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href="#waitlist"]');
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        openWaitlist();
      }
    };

    // Écouter les changements de hash
    const handleHashChange = () => {
      if (window.location.hash === "#waitlist") {
        openWaitlist();
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    };

    // Vérifier le hash au chargement
    if (window.location.hash === "#waitlist") {
      openWaitlist();
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    // Exposer une fonction globale pour que le script externe puisse ouvrir la popup
    (window as any).openWaitlist = openWaitlist;

    document.addEventListener("click", handleClick, true);
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("hashchange", handleHashChange);
      delete (window as any).openWaitlist;
    };
  }, [openWaitlist]);

  return null;
}
