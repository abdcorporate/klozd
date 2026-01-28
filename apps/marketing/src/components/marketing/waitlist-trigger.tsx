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
    // Intercepter les clics sur les boutons/liens waitlist
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Ne pas intercepter les clics à l'intérieur de la modale (ex: bouton submit)
      if (target.closest('[role="dialog"]')) return;

      // Check for waitlist links
      const link = target.closest('a[href="#waitlist"], a[href*="waitlist"]');
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        openWaitlist();
        return;
      }

      // Check for buttons with waitlist-related text
      const button = target.closest('button');
      if (button) {
        const buttonText = button.textContent?.toLowerCase() || '';
        if (
          buttonText.includes('waitlist') ||
          buttonText.includes('rejoindre la waitlist') ||
          buttonText.includes('join the waitlist') ||
          buttonText.includes('réserver ma place') ||
          buttonText.includes('secure my spot') ||
          buttonText.includes('rejoindre') && buttonText.includes('500')
        ) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          openWaitlist();
          return;
        }
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

    // MutationObserver pour détecter et supprimer le popup du bundle
    const observer = new MutationObserver(() => {
      const root = document.getElementById('root');
      if (!root) return;

      // Chercher les popups/modals dans #root qui contiennent un formulaire email
      const fixedElements = root.querySelectorAll('[class*="fixed"]');
      fixedElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          const hasEmailInput = el.querySelector('input[type="email"]');
          const hasBackdrop = el.classList.toString().includes('inset-0') ||
                              el.classList.toString().includes('backdrop') ||
                              getComputedStyle(el).position === 'fixed';

          if (hasEmailInput && hasBackdrop) {
            // C'est le popup du bundle - le supprimer et ouvrir le nôtre
            el.style.display = 'none';
            el.remove();
            openWaitlist();
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Use capture phase to intercept before the bundled JS
    document.addEventListener("click", handleClick, true);
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("hashchange", handleHashChange);
      observer.disconnect();
      delete (window as any).openWaitlist;
    };
  }, [openWaitlist]);

  return null;
}
