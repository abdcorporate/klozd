"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { Language } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr");
  const languageRef = useRef<Language>("fr");

  useEffect(() => {
    // Load from localStorage or default to French
    const saved = localStorage.getItem("language") as Language;
    if (saved === "fr" || saved === "en") {
      setLanguage(saved);
      languageRef.current = saved;
    }

    // Listen for storage changes (when language is changed from external script)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "language" && (e.newValue === "fr" || e.newValue === "en")) {
        setLanguage(e.newValue as Language);
        languageRef.current = e.newValue as Language;
      }
    };

    // Listen for custom event (for same-window changes)
    const handleLanguageChange = (e: CustomEvent) => {
      if (e.detail === "fr" || e.detail === "en") {
        setLanguage(e.detail as Language);
        languageRef.current = e.detail as Language;
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("languagechange", handleLanguageChange as EventListener);

    // Also poll localStorage periodically to catch changes from external scripts
    const interval = setInterval(() => {
      try {
        const current = localStorage.getItem("language") as Language;
        if ((current === "fr" || current === "en") && current !== languageRef.current) {
          setLanguage(current);
          languageRef.current = current;
        }
      } catch (e) {
        // Ignore errors
      }
    }, 50); // Check more frequently for better responsiveness

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("languagechange", handleLanguageChange as EventListener);
      clearInterval(interval);
    };
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    languageRef.current = lang;
    localStorage.setItem("language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
