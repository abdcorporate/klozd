"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function FooterNew() {
  const router = useRouter();
  const pathname = usePathname();

  // Gérer le scroll vers l'ancre au chargement de la page
  useEffect(() => {
    if (pathname === '/' && typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        const anchor = hash.substring(1);
        setTimeout(() => {
          const element = document.getElementById(anchor);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  }, [pathname]);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const [path, anchor] = href.split('#');
    
    if (pathname !== path) {
      router.push(href);
      // Scroll après un délai pour laisser la page se charger
      setTimeout(() => {
        const element = document.getElementById(anchor);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } else {
      // Si on est déjà sur la page, scroll directement
      const element = document.getElementById(anchor);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <footer className="bg-foreground text-background py-12 md:py-16 animate-fade-in">
      <div className="container-narrow">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <span className="font-bold tracking-tight text-2xl mb-4 block">
              <span className="text-primary">K</span>
              <span>LOZD</span>
            </span>
            <p className="text-background/70 text-sm max-w-xs">
              Le CRM qui veut vraiment t'aider à closer plus de deals.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-background/50">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/#features" 
                  onClick={(e) => handleAnchorClick(e, "/#features")}
                  className="text-background/70 hover:text-background hover:text-primary transition-colors text-sm cursor-pointer"
                >
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a 
                  href="/#pricing" 
                  onClick={(e) => handleAnchorClick(e, "/#pricing")}
                  className="text-background/70 hover:text-background hover:text-primary transition-colors text-sm cursor-pointer"
                >
                  Prix
                </a>
              </li>
              <li>
                <a 
                  href="/#for-who" 
                  onClick={(e) => handleAnchorClick(e, "/#for-who")}
                  className="text-background/70 hover:text-background hover:text-primary transition-colors text-sm cursor-pointer"
                >
                  Pour qui
                </a>
              </li>
              <li>
                <a 
                  href="/#faq" 
                  onClick={(e) => handleAnchorClick(e, "/#faq")}
                  className="text-background/70 hover:text-background hover:text-primary transition-colors text-sm cursor-pointer"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-background/50">
              Légal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-background/70 hover:text-background hover:text-primary transition-colors text-sm">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-background/70 hover:text-background hover:text-primary transition-colors text-sm">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-background/10 text-center">
          <p className="text-sm text-background/50">© 2025 KLOZD. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
