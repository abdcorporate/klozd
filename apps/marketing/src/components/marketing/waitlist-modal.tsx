"use client";

import { useEffect } from "react";
import { useWaitlist } from "./waitlist-context";
import { WaitlistForm } from "./waitlist-form";
import { useLanguage } from "./language-provider";
import { translations } from "@/lib/translations";

export function WaitlistModal() {
  const { isOpen, closeWaitlist } = useWaitlist();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          closeWaitlist();
        }
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, closeWaitlist]);

  // Sync language based on page content when modal opens
  useEffect(() => {
    if (isOpen) {
      // Add a small delay to ensure bundled content is fully rendered
      const detectLanguage = () => {
        const root = document.getElementById("root");
        if (root) {
          const pageText = root.textContent || "";

          // Check for French phrases - if found, use French
          const isFrench =
            pageText.includes("Rejoindre la waitlist") ||
            pageText.includes("Closez plus") ||
            pageText.includes("Stressez moins") ||
            pageText.includes("Fonctionnalités") ||
            pageText.includes("Calculer mes économies") ||
            pageText.includes("Calculez vos économies");

          const detectedLang = isFrench ? "fr" : "en";

          console.log("Modal detected language:", detectedLang, "isFrench:", isFrench, "pageText sample:", pageText.substring(0, 200));

          // Force update the language
          setLanguage(detectedLang);
          localStorage.setItem("language", detectedLang);
        }
      };

      // Run immediately and after a short delay
      detectLanguage();
      const timer = setTimeout(detectLanguage, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, setLanguage]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={closeWaitlist}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={closeWaitlist}
          aria-label={translations.waitlist.modal.close[language]}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-klozd-gray-600 hover:bg-klozd-gray-100 focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:ring-offset-2 transition"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {/* Header */}
        <div className="mb-3 pr-10">
          <h2 className="text-2xl font-bold text-klozd-black">
            {translations.waitlist.modal.title[language]}
          </h2>
          <p className="mt-2 text-sm leading-6 text-klozd-gray-600">
            {translations.waitlist.modal.description[language]}
          </p>
        </div>

        {/* Form */}
        <WaitlistForm onSuccess={closeWaitlist} />
      </div>
    </div>
  );
}
