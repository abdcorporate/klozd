"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-fade-in ${
      isScrolled ? "bg-background/95 backdrop-blur-lg shadow-sm" : "bg-transparent"
    }`}>
      <div className="container-narrow">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href="/" className="flex items-center group animate-slide-in-left delay-100">
            <span className="font-bold tracking-tight text-xl md:text-2xl transition-colors group-hover:text-primary">
              <span className="text-primary">K</span>
              <span className="text-foreground">LOZD</span>
            </span>
          </a>
          
          <div className="hidden md:flex items-center gap-8 animate-slide-in-right delay-200">
            <Button variant="primary" size="sm" className="h-10 px-6 rounded-xl font-semibold bg-[#FFD700] hover:bg-[#FFC107] text-black shadow-lg hover:shadow-xl" href="/waitlist">
              S'inscrire
            </Button>
          </div>
          
          <button 
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
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
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg">
            <div className="flex flex-col py-4 space-y-4">
              <div className="px-4">
                <Button variant="primary" size="sm" className="w-full h-10 rounded-xl font-semibold bg-[#FFD700] hover:bg-[#FFC107] text-black shadow-lg hover:shadow-xl" href="/waitlist" onClick={() => setIsMobileMenuOpen(false)}>
                  S'inscrire
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
