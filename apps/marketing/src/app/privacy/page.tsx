"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

// Composants d'icônes SVG inline
const ShieldIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const UsersIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const FileTextIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
  </svg>
);

const LockIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const GavelIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10"/>
    <path d="m16 16 6-6"/>
    <path d="m8 8 6-6"/>
    <path d="m9 7 8 8"/>
    <path d="m21 11-8-8"/>
  </svg>
);

const CookieIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
    <path d="M8.5 8.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/>
    <path d="M16 15a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/>
  </svg>
);

const GlobeIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
    <path d="M2 12h20"/>
  </svg>
);

const BabyIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12h.01"/>
    <path d="M15 12h.01"/>
    <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/>
    <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3a9 9 0 0 1 7 3.3"/>
    <path d="M12 3v18"/>
  </svg>
);

const InfoIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
);

const MailIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const HomeIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const CheckCircle2Icon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const ClockIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const AlertCircleIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" x2="12" y1="8" y2="12"/>
    <line x1="12" x2="12.01" y1="16" y2="16"/>
  </svg>
);

const ExternalLinkIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" x2="21" y1="14" y2="3"/>
  </svg>
);

export default function PrivacyPage() {
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    // Vérifier si le bundle JS a déjà été chargé (sur la page d'accueil)
    const existingRoot = document.getElementById('root');
    if (existingRoot && existingRoot.children.length > 0) {
      // Le bundle JS est déjà chargé, extraire directement le header/footer
      const header = existingRoot.querySelector('nav') || existingRoot.querySelector('header');
      const footer = existingRoot.querySelector('footer');
      
      if (header || footer) {
        // Créer un conteneur pour le header s'il n'existe pas déjà
            let headerContainer = document.getElementById('privacy-header-container');
            if (!headerContainer && header) {
              headerContainer = document.createElement('div');
              headerContainer.id = 'privacy-header-container';
              headerContainer.style.position = 'fixed';
              headerContainer.style.top = '0';
              headerContainer.style.left = '0';
              headerContainer.style.right = '0';
              headerContainer.style.zIndex = '50';
              document.body.insertBefore(headerContainer, document.body.firstChild);
              const clonedHeader = header.cloneNode(true) as HTMLElement;
              
              // Supprimer les messages d'erreur 404 du header
              const errorMessages = clonedHeader.querySelectorAll('*');
              errorMessages.forEach((el) => {
                const text = el.textContent || '';
                if (text.includes('404') || text.includes('Page not found') || text.includes('page not found')) {
                  el.remove();
                }
              });
              
              headerContainer.appendChild(clonedHeader);
              
              // Nettoyer le header après insertion pour supprimer les messages d'erreur 404
              setTimeout(() => {
                const allElements = headerContainer?.querySelectorAll('*');
                allElements?.forEach((el) => {
                  const text = el.textContent || '';
                  if (text.includes('404') || text.includes('Page not found') || text.includes('page not found') || text.includes('Oops')) {
                    el.remove();
                  }
                });
                // Nettoyer aussi le texte direct du header
                if (headerContainer?.textContent?.includes('404')) {
                  const textNodes: Node[] = [];
                  const walker = document.createTreeWalker(headerContainer, NodeFilter.SHOW_TEXT);
                  let node;
                  while (node = walker.nextNode()) {
                    if (node.textContent?.includes('404') || node.textContent?.includes('Page not found')) {
                      textNodes.push(node);
                    }
                  }
                  textNodes.forEach(n => n.parentNode?.removeChild(n));
                }
              }, 100);
            }
            
            // Créer un conteneur pour le footer s'il n'existe pas déjà
        let footerContainer = document.getElementById('privacy-footer-container');
        if (!footerContainer && footer) {
          footerContainer = document.createElement('div');
          footerContainer.id = 'privacy-footer-container';
          document.body.appendChild(footerContainer);
          footerContainer.appendChild(footer.cloneNode(true));
        }
      }
      return;
    }

    // Si le bundle JS n'est pas chargé, le charger uniquement pour extraire le header/footer
    const originalError = console.error;
    console.error = (...args: any[]) => {
      // Ignorer les erreurs 404 de routage du bundle JS
      if (args[0]?.includes?.('404') && args[0]?.includes?.('route')) {
        return;
      }
      originalError.apply(console, args);
    };

    const script = document.createElement('script');
    script.type = 'module';
    script.crossOrigin = 'anonymous';
    script.src = '/js/index-BgtM3Jyb.js';
    
    script.onload = () => {
      const checkInterval = setInterval(() => {
        const root = document.getElementById('root');
        if (root && root.children.length > 0) {
          const header = root.querySelector('nav') || root.querySelector('header');
          const footer = root.querySelector('footer');
          
          if (header || footer) {
            clearInterval(checkInterval);
            
            let headerContainer = document.getElementById('privacy-header-container');
            if (!headerContainer && header) {
              headerContainer = document.createElement('div');
              headerContainer.id = 'privacy-header-container';
              headerContainer.style.position = 'fixed';
              headerContainer.style.top = '0';
              headerContainer.style.left = '0';
              headerContainer.style.right = '0';
              headerContainer.style.zIndex = '50';
              document.body.insertBefore(headerContainer, document.body.firstChild);
              const clonedHeader = header.cloneNode(true) as HTMLElement;
              
              // Supprimer les messages d'erreur 404 du header
              const errorMessages = clonedHeader.querySelectorAll('*');
              errorMessages.forEach((el) => {
                const text = el.textContent || '';
                if (text.includes('404') || text.includes('Page not found') || text.includes('page not found')) {
                  el.remove();
                }
              });
              
              headerContainer.appendChild(clonedHeader);
              
              // Nettoyer le header après insertion pour supprimer les messages d'erreur 404
              setTimeout(() => {
                const allElements = headerContainer?.querySelectorAll('*');
                allElements?.forEach((el) => {
                  const text = el.textContent || '';
                  if (text.includes('404') || text.includes('Page not found') || text.includes('page not found') || text.includes('Oops')) {
                    el.remove();
                  }
                });
                // Nettoyer aussi le texte direct du header
                if (headerContainer?.textContent?.includes('404')) {
                  const textNodes: Node[] = [];
                  const walker = document.createTreeWalker(headerContainer, NodeFilter.SHOW_TEXT);
                  let node;
                  while (node = walker.nextNode()) {
                    if (node.textContent?.includes('404') || node.textContent?.includes('Page not found')) {
                      textNodes.push(node);
                    }
                  }
                  textNodes.forEach(n => n.parentNode?.removeChild(n));
                }
              }, 100);
            }
            
            let footerContainer = document.getElementById('privacy-footer-container');
            if (!footerContainer && footer) {
              footerContainer = document.createElement('div');
              footerContainer.id = 'privacy-footer-container';
              document.body.appendChild(footerContainer);
              footerContainer.appendChild(footer.cloneNode(true));
            }
            
            // Supprimer complètement le contenu 404 du root
            const mainContent = root.querySelector('main');
            if (mainContent) {
              mainContent.remove();
            }
            
            // Supprimer tous les éléments contenant des messages d'erreur 404
            const allElements = root.querySelectorAll('*');
            allElements.forEach((el) => {
              const text = el.textContent || '';
              if (text.includes('404') || text.includes('Page not found') || text.includes('page not found') || text.includes('Oops') || text.includes('Return to Home')) {
                el.remove();
              }
            });
            
            // Nettoyer aussi les nœuds texte directs
            const textNodes: Node[] = [];
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
            let node;
            while (node = walker.nextNode()) {
              if (node.textContent?.includes('404') || node.textContent?.includes('Page not found') || node.textContent?.includes('Oops') || node.textContent?.includes('Return to Home')) {
                textNodes.push(node);
              }
            }
            textNodes.forEach(n => n.remove());
            
            // Supprimer tout le contenu visible sauf le header et footer
            root.innerHTML = '';
            root.style.display = 'none';
            console.error = originalError;
          }
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkInterval);
        console.error = originalError;
      }, 5000);
    };
    
    document.body.appendChild(script);
    
    return () => {
      const scriptElement = document.querySelector('script[src="/js/index-BgtM3Jyb.js"]');
      if (scriptElement && scriptElement !== script) {
        // Ne pas supprimer si c'est le script de la page d'accueil
      }
      console.error = originalError;
    };
  }, []);

  const lastUpdatedDate = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  const SectionBadge = ({ number, title, icon: Icon }: { number: string; title: string; icon?: any }) => (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-klozd-yellow/20 text-klozd-yellow text-sm font-medium mb-6">
      <span className="font-bold text-klozd-black">{number}.</span>
      {Icon && <Icon size={16} className="text-klozd-yellow" />}
      <span>{title}</span>
    </div>
  );

  const ListItem = ({ children, icon: Icon = CheckCircle2Icon }: { children: React.ReactNode; icon?: any }) => (
    <li className="flex items-start gap-3">
      <Icon size={20} className="text-klozd-yellow mt-0.5 flex-shrink-0" />
      <span className="text-klozd-gray-600">{children}</span>
    </li>
  );

  useEffect(() => {
    // Nettoyer périodiquement le contenu 404 qui pourrait apparaître
    const cleanupInterval = setInterval(() => {
      const root = document.getElementById('root');
      if (root) {
        // Supprimer tous les éléments contenant 404
        const allElements = root.querySelectorAll('*');
        allElements.forEach((el) => {
          const text = el.textContent || '';
          if (text.includes('404') || text.includes('Page not found') || text.includes('Oops') || text.includes('Return to Home')) {
            el.remove();
          }
        });
        
        // Supprimer les nœuds texte directs
        const textNodes: Node[] = [];
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node;
        while (node = walker.nextNode()) {
          if (node.textContent?.includes('404') || node.textContent?.includes('Page not found') || node.textContent?.includes('Oops') || node.textContent?.includes('Return to Home')) {
            textNodes.push(node);
          }
        }
        textNodes.forEach(n => n.remove());
        
        // Si le root contient encore du contenu visible, le vider
        if (root.children.length > 0 && root.style.display !== 'none') {
          const hasHeader = root.querySelector('nav') || root.querySelector('header');
          const hasFooter = root.querySelector('footer');
          if (!hasHeader && !hasFooter) {
            root.innerHTML = '';
            root.style.display = 'none';
          }
        }
      }
      
      // Nettoyer aussi dans le body directement
      const bodyElements = document.body.querySelectorAll('*');
      bodyElements.forEach((el) => {
        if (el.id === 'root' || el.id === 'privacy-header-container' || el.id === 'privacy-footer-container') {
          return;
        }
        const text = el.textContent || '';
        if ((text.includes('404') || text.includes('Page not found') || text.includes('Oops')) && text.length < 100) {
          el.remove();
        }
      });
    }, 200);
    
    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <>
      <div id="root" style={{ paddingTop: '80px', display: 'none' }}></div>
      <div className="min-h-screen bg-gradient-to-b from-klozd-gray-100 to-white">
        <main className="pt-24 pb-20 md:pt-32">
          <div className="container-klozd">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl border border-border shadow-xl p-8 md:p-12 lg:p-16">
                {/* Header */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-klozd-yellow/20 text-klozd-yellow text-sm font-medium mb-4">
                    <ShieldIcon size={16} />
                    <span>Protection des données</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-klozd-black mb-4">
                    Politique de confidentialité
                  </h1>
                  <p className="text-lg text-klozd-gray-600 mb-2">
                    Votre vie privée est notre priorité.
                  </p>
                  <p className="text-sm text-klozd-gray-400">
                    Dernière mise à jour : {lastUpdatedDate}
                  </p>
                </div>

                <div className="space-y-12">
                  {/* Section 1: Introduction */}
                  <section>
                    <SectionBadge number="1" title="Introduction" icon={InfoIcon} />
                    <p className="text-klozd-gray-600 leading-relaxed">
                      KLOZD s'engage à protéger votre vie privée et vos données personnelles. Cette politique de confidentialité
                      explique comment nous collectons, utilisons, stockons et protégeons vos informations personnelles conformément
                      au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
                    </p>
                  </section>

                  {/* Section 2: Responsable du traitement */}
                  <section>
                    <SectionBadge number="2" title="Responsable du traitement" icon={UsersIcon} />
                    <p className="text-klozd-gray-600 leading-relaxed">
                      Le responsable du traitement des données personnelles est KLOZD. Pour toute question concernant le traitement
                      de vos données, vous pouvez nous contacter via notre formulaire de contact ou à l'adresse email indiquée sur notre site.
                    </p>
                  </section>

                  {/* Section 3: Données collectées */}
                  <section>
                    <SectionBadge number="3" title="Données collectées" icon={FileTextIcon} />
                    <p className="text-klozd-gray-600 leading-relaxed mb-6">
                      Nous collectons les données suivantes :
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-klozd-gray-100 rounded-xl p-6 border border-border">
                        <h3 className="text-xl font-semibold text-klozd-black mb-4 flex items-center gap-2">
                          <CheckCircle2Icon size={20} className="text-klozd-yellow" /> Données d'identification
                        </h3>
                        <ul className="space-y-2">
                          <ListItem>Nom et prénom</ListItem>
                          <ListItem>Adresse email</ListItem>
                          <ListItem>Numéro de téléphone (optionnel)</ListItem>
                          <ListItem>Informations de facturation</ListItem>
                        </ul>
                      </div>
                      <div className="bg-klozd-gray-100 rounded-xl p-6 border border-border">
                        <h3 className="text-xl font-semibold text-klozd-black mb-4 flex items-center gap-2">
                          <CheckCircle2Icon size={20} className="text-klozd-yellow" /> Données d'utilisation
                        </h3>
                        <ul className="space-y-2">
                          <ListItem>Données de connexion (adresse IP, type de navigateur, système d'exploitation)</ListItem>
                          <ListItem>Historique d'utilisation de la plateforme</ListItem>
                          <ListItem>Préférences et paramètres</ListItem>
                        </ul>
                      </div>
                      <div className="bg-klozd-gray-100 rounded-xl p-6 border border-border md:col-span-2">
                        <h3 className="text-xl font-semibold text-klozd-black mb-4 flex items-center gap-2">
                          <CheckCircle2Icon size={20} className="text-klozd-yellow" /> Données de contenu
                        </h3>
                        <ul className="space-y-2">
                          <ListItem>Leads et contacts que vous ajoutez</ListItem>
                          <ListItem>Formulaires créés et réponses collectées</ListItem>
                          <ListItem>Notes, tâches et interactions</ListItem>
                          <ListItem>Données de pipeline et transactions</ListItem>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Section 4: Finalités du traitement */}
                  <section>
                    <SectionBadge number="4" title="Finalités du traitement" icon={LockIcon} />
                    <p className="text-klozd-gray-600 leading-relaxed mb-6">
                      Nous utilisons vos données pour :
                    </p>
                    <ul className="space-y-2">
                      <ListItem>Fournir et améliorer nos services</ListItem>
                      <ListItem>Gérer votre compte et votre abonnement</ListItem>
                      <ListItem>Traiter les paiements et la facturation</ListItem>
                      <ListItem>Vous contacter concernant votre compte ou nos services</ListItem>
                      <ListItem>Personnaliser votre expérience utilisateur</ListItem>
                      <ListItem>Analyser l'utilisation de la plateforme pour améliorer nos fonctionnalités</ListItem>
                      <ListItem>Respecter nos obligations légales et réglementaires</ListItem>
                      <ListItem>Détecter et prévenir la fraude ou les abus</ListItem>
                    </ul>
                  </section>

                  {/* Section 5: Base légale */}
                  <section>
                    <SectionBadge number="5" title="Base légale du traitement" icon={GavelIcon} />
                    <p className="text-klozd-gray-600 leading-relaxed mb-6">
                      Le traitement de vos données personnelles est basé sur :
                    </p>
                    <ul className="space-y-2">
                      <ListItem><strong>L'exécution d'un contrat</strong> : pour fournir les services souscrits</ListItem>
                      <ListItem><strong>Votre consentement</strong> : pour les communications marketing et les cookies non essentiels</ListItem>
                      <ListItem><strong>Notre intérêt légitime</strong> : pour améliorer nos services et prévenir la fraude</ListItem>
                      <ListItem><strong>Les obligations légales</strong> : pour respecter la réglementation applicable</ListItem>
                    </ul>
                  </section>

                  {/* Section 6: Conservation */}
                  <section>
                    <SectionBadge number="6" title="Conservation des données" icon={ClockIcon} />
                    <p className="text-klozd-gray-600 leading-relaxed mb-6">
                      Nous conservons vos données personnelles :
                    </p>
                    <ul className="space-y-2">
                      <ListItem><strong>Pendant la durée de votre abonnement</strong> et 30 jours après sa résiliation</ListItem>
                      <ListItem><strong>Données de facturation</strong> : 10 ans conformément aux obligations comptables</ListItem>
                      <ListItem><strong>Données de connexion</strong> : 12 mois maximum</ListItem>
                      <ListItem><strong>Données de consentement marketing</strong> : jusqu'à retrait du consentement</ListItem>
                    </ul>
                    <div className="mt-4 p-4 bg-klozd-yellow/10 rounded-lg border border-klozd-yellow/30">
                      <p className="text-klozd-gray-600 leading-relaxed flex items-start gap-2">
                        <AlertCircleIcon size={18} className="text-klozd-yellow mt-0.5 flex-shrink-0" />
                        <span>Après ces délais, vos données sont supprimées ou anonymisées de manière sécurisée.</span>
                      </p>
                    </div>
                  </section>

                  {/* Section 7: Partage des données */}
                  <section>
                    <SectionBadge number="7" title="Partage des données" icon={UsersIcon} />
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                      <p className="text-blue-900 font-semibold flex items-center gap-2">
                        <ShieldIcon size={20} />
                        Nous ne vendons jamais vos données personnelles.
                      </p>
                    </div>
                    <p className="text-klozd-gray-600 leading-relaxed mb-6">
                      Nous pouvons partager vos données avec :
                    </p>
                    <ul className="space-y-2">
                      <ListItem><strong>Prestataires de services</strong> : hébergement, paiement, email (sous contrat strict de confidentialité)</ListItem>
                      <ListItem><strong>Autorités compétentes</strong> : si requis par la loi ou une décision judiciaire</ListItem>
                      <ListItem><strong>En cas de fusion ou acquisition</strong> : avec notification préalable</ListItem>
                    </ul>
                    <div className="mt-4 p-4 bg-green-100 rounded-lg border border-green-300 text-green-800">
                      <p className="text-sm leading-relaxed">
                        Tous nos prestataires sont situés dans l'Union Européenne ou bénéficient de garanties appropriées
                        (clauses contractuelles types, Privacy Shield, etc.).
                      </p>
                    </div>
                  </section>

                  {/* Section 8: Sécurité */}
                  <section>
                    <SectionBadge number="8" title="Sécurité des données" icon={LockIcon} />
                    <p className="text-klozd-gray-600 leading-relaxed mb-6">
                      Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
                    </p>
                    <ul className="space-y-2">
                      <ListItem>Chiffrement des données en transit (HTTPS/TLS) et au repos</ListItem>
                      <ListItem>Authentification forte et gestion sécurisée des mots de passe</ListItem>
                      <ListItem>Surveillance et détection d'intrusions</ListItem>
                      <ListItem>Sauvegardes régulières et sécurisées</ListItem>
                      <ListItem>Accès restreint aux données (principe du moindre privilège)</ListItem>
                      <ListItem>Formation du personnel à la protection des données</ListItem>
                    </ul>
                  </section>

                  {/* Section 9: Vos droits */}
                  <section>
                    <SectionBadge number="9" title="Vos droits" icon={GavelIcon} />
                    <p className="text-klozd-gray-600 leading-relaxed mb-6">
                      Conformément au RGPD, vous disposez des droits suivants :
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-klozd-yellow/5 to-klozd-yellow/10 rounded-xl p-4 border border-klozd-yellow/20">
                        <h3 className="font-semibold text-klozd-black mb-1 flex items-center gap-2">
                          <CheckCircle2Icon size={16} className="text-klozd-yellow" />
                          Droit d'accès
                        </h3>
                        <p className="text-sm text-klozd-gray-600">Obtenir une copie de vos données personnelles</p>
                      </div>
                      <div className="bg-gradient-to-br from-klozd-yellow/5 to-klozd-yellow/10 rounded-xl p-4 border border-klozd-yellow/20">
                        <h3 className="font-semibold text-klozd-black mb-1 flex items-center gap-2">
                          <CheckCircle2Icon size={16} className="text-klozd-yellow" />
                          Droit de rectification
                        </h3>
                        <p className="text-sm text-klozd-gray-600">Corriger vos données inexactes ou incomplètes</p>
                      </div>
                      <div className="bg-gradient-to-br from-klozd-yellow/5 to-klozd-yellow/10 rounded-xl p-4 border border-klozd-yellow/20">
                        <h3 className="font-semibold text-klozd-black mb-1 flex items-center gap-2">
                          <CheckCircle2Icon size={16} className="text-klozd-yellow" />
                          Droit à l'effacement
                        </h3>
                        <p className="text-sm text-klozd-gray-600">Demander la suppression de vos données</p>
                      </div>
                      <div className="bg-gradient-to-br from-klozd-yellow/5 to-klozd-yellow/10 rounded-xl p-4 border border-klozd-yellow/20">
                        <h3 className="font-semibold text-klozd-black mb-1 flex items-center gap-2">
                          <CheckCircle2Icon size={16} className="text-klozd-yellow" />
                          Droit à la portabilité
                        </h3>
                        <p className="text-sm text-klozd-gray-600">Récupérer vos données dans un format structuré</p>
                      </div>
                    </div>
                    <div className="bg-klozd-yellow/10 border border-klozd-yellow/30 rounded-xl p-4">
                      <p className="text-klozd-gray-700 leading-relaxed flex items-start gap-2">
                        <MailIcon size={18} className="text-klozd-yellow mt-0.5 flex-shrink-0" />
                        <span>Pour exercer ces droits, contactez-nous via notre formulaire de contact ou à l'adresse email indiquée.
                        Nous répondrons dans un délai d'un mois maximum.</span>
                      </p>
                    </div>
                  </section>

                  {/* Section 10: Cookies */}
                  <section>
                    <SectionBadge number="10" title="Cookies et technologies similaires" icon={CookieIcon} />
                    <p className="text-klozd-gray-600 leading-relaxed mb-6">
                      Nous utilisons des cookies et technologies similaires pour :
                    </p>
                    <ul className="space-y-2">
                      <ListItem><strong>Cookies essentiels</strong> : nécessaires au fonctionnement de la plateforme (authentification, sécurité)</ListItem>
                      <ListItem><strong>Cookies analytiques</strong> : pour comprendre l'utilisation de la plateforme (avec votre consentement)</ListItem>
                      <ListItem><strong>Cookies de préférences</strong> : pour mémoriser vos paramètres</ListItem>
                    </ul>
                    <div className="mt-4 p-4 bg-klozd-yellow/10 rounded-lg border border-klozd-yellow/30">
                      <p className="text-klozd-gray-600 leading-relaxed">
                        Vous pouvez gérer vos préférences de cookies depuis les paramètres de votre navigateur ou notre bandeau de consentement.
                      </p>
                    </div>
                  </section>

                  {/* Section 11: Transferts internationaux */}
                  <section>
                    <SectionBadge number="11" title="Transferts internationaux" icon={GlobeIcon} />
                    <p className="text-klozd-gray-600 leading-relaxed">
                      Vos données sont principalement stockées et traitées dans l'Union Européenne. En cas de transfert vers
                      un pays tiers, nous nous assurons que des garanties appropriées sont en place (clauses contractuelles types,
                      Privacy Shield, etc.) conformément au RGPD.
                    </p>
                  </section>

                  {/* Section 12: Données des mineurs */}
                  <section>
                    <SectionBadge number="12" title="Données des mineurs" icon={BabyIcon} />
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <p className="text-orange-900 leading-relaxed">
                        KLOZD n'est pas destiné aux personnes de moins de 18 ans. Nous ne collectons pas sciemment de données
                        personnelles de mineurs. Si nous apprenons qu'un mineur nous a fourni des données, nous les supprimerons immédiatement.
                      </p>
                    </div>
                  </section>

                  {/* Section 13: Modifications */}
                  <section>
                    <SectionBadge number="13" title="Modifications de cette politique" icon={InfoIcon} />
                    <p className="text-klozd-gray-600 leading-relaxed">
                      Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications seront publiées
                      sur cette page avec une date de mise à jour. Nous vous informerons des modifications importantes par email
                      ou via une notification dans la plateforme.
                    </p>
                  </section>

                  {/* Section 14: Réclamation */}
                  <section>
                    <SectionBadge number="14" title="Réclamation" icon={GavelIcon} />
                    <p className="text-klozd-gray-600 leading-relaxed mb-4">
                      Si vous estimez que le traitement de vos données personnelles constitue une violation du RGPD, vous avez
                      le droit d'introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) :
                    </p>
                    <div className="bg-klozd-gray-100 rounded-xl p-5 border-l-4 border-klozd-yellow">
                      <p className="text-klozd-black font-semibold mb-2">CNIL</p>
                      <p className="text-klozd-gray-600 text-sm leading-relaxed">
                        3 Place de Fontenoy - TSA 80715<br />
                        75334 PARIS CEDEX 07<br />
                        Téléphone : 01 53 73 22 22<br />
                        Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-klozd-yellow hover:underline font-medium inline-flex items-center gap-1">
                          www.cnil.fr <ExternalLinkIcon size={14} />
                        </a>
                      </p>
                    </div>
                  </section>

                  {/* Section 15: Contact */}
                  <section>
                    <SectionBadge number="15" title="Contact" icon={MailIcon} />
                    <div className="bg-gradient-to-br from-klozd-yellow/10 to-klozd-yellow/5 rounded-xl p-6 border border-klozd-yellow/20">
                      <p className="text-klozd-gray-700 leading-relaxed mb-4">
                        Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles,
                        vous pouvez nous contacter via notre formulaire de contact ou à l'adresse email indiquée sur notre site.
                      </p>
                      <Link 
                        href="/#waitlist" 
                        className="inline-flex items-center gap-2 px-6 py-3 bg-klozd-black text-white rounded-full font-medium hover:bg-klozd-gray-900 transition-colors"
                      >
                        <MailIcon size={18} />
                        <span>Nous contacter</span>
                      </Link>
                    </div>
                  </section>

                  {/* Back to Home */}
                  <div className="text-center mt-12 pt-8 border-t border-border">
                    <Link 
                      href="/" 
                      className="inline-flex items-center gap-2 text-klozd-gray-600 hover:text-klozd-black transition-colors"
                    >
                      <HomeIcon size={18} />
                      <span>Retour à l'accueil</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
