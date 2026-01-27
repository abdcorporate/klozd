"use client";

import { useLanguage } from "./language-provider";
import { translations } from "@/lib/translations";

export function FooterLovable() {
  const { language } = useLanguage();
  const footer = translations.footer;

  return (
    <footer className="bg-klozd-black text-white py-12">
      <div className="container-klozd">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">KLOZD</h3>
            <p className="text-white/60 mb-4">
              {footer.tagline[language]}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{footer.product[language]}</h4>
            <ul className="space-y-2 text-white/60">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  {footer.features[language]}
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  {translations.nav.pricing[language]}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  {translations.nav.faq[language]}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            {footer.copyright[language]}
          </p>
        </div>
      </div>
    </footer>
  );
}
