"use client";

import Link from "next/link";
import Image from "next/image";
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
    <footer className="bg-foreground text-background py-8 sm:py-12 md:py-16 animate-fade-in">
      <div className="container-narrow px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center" style={{ minHeight: '48px' }}>
              <img
                src="/logo.png"
                alt="KLOZD"
                width={180}
                height={60}
                className="h-10 md:h-12 w-auto"
                style={{ 
                  maxWidth: '180px',
                  opacity: 1,
                  visibility: 'visible',
                  display: 'block'
                }}
              />
            </div>
            <p className="text-background/70 text-sm max-w-xs">
              Le CRM tout-en-un.
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
