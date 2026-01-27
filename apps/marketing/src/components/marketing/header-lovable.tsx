"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "./language-provider";
import { translations, t } from "@/lib/translations";
import { Button } from "@/components/ui/button";

interface HeaderLovableProps {
  onOpenWaitlist?: () => void;
}

export function HeaderLovable({ onOpenWaitlist }: HeaderLovableProps = {}) {
  const { language, setLanguage } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleWaitlistClick = () => {
    if (onOpenWaitlist) {
      onOpenWaitlist();
      setIsMobileMenuOpen(false);
    } else {
      window.location.href = "#waitlist";
    }
  };

  const nav = translations.nav;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass-nav ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="container-klozd">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-klozd-black">KLOZD</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-klozd-gray-600 hover:text-klozd-black transition-colors">
              {nav.features[language]}
            </a>
            <a href="#pricing" className="text-klozd-gray-600 hover:text-klozd-black transition-colors">
              {nav.pricing[language]}
            </a>
            <a href="#faq" className="text-klozd-gray-600 hover:text-klozd-black transition-colors">
              {nav.faq[language]}
            </a>
            
            <div className="flex items-center gap-2 border border-border rounded-full px-2 py-1">
              <button
                onClick={() => setLanguage("fr")}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  language === "fr"
                    ? "bg-klozd-black text-white"
                    : "text-klozd-gray-600 hover:text-klozd-black"
                }`}
              >
                FR
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  language === "en"
                    ? "bg-klozd-black text-white"
                    : "text-klozd-gray-600 hover:text-klozd-black"
                }`}
              >
                EN
              </button>
            </div>

            <Button
              onClick={handleWaitlistClick}
              className="btn-primary"
            >
              {nav.waitlist[language]}
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-klozd-black"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white">
            <div className="flex flex-col py-4 space-y-4">
              <a href="#features" className="px-4 text-klozd-gray-600 hover:text-klozd-black">
                {nav.features[language]}
              </a>
              <a href="#pricing" className="px-4 text-klozd-gray-600 hover:text-klozd-black">
                {nav.pricing[language]}
              </a>
              <a href="#faq" className="px-4 text-klozd-gray-600 hover:text-klozd-black">
                {nav.faq[language]}
              </a>
              <div className="px-4 flex items-center gap-2">
                <button
                  onClick={() => setLanguage("fr")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    language === "fr" ? "bg-klozd-black text-white" : "text-klozd-gray-600"
                  }`}
                >
                  FR
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    language === "en" ? "bg-klozd-black text-white" : "text-klozd-gray-600"
                  }`}
                >
                  EN
                </button>
              </div>
              <div className="px-4">
                <Button onClick={handleWaitlistClick} className="btn-primary w-full">
                  {nav.waitlist[language]}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
