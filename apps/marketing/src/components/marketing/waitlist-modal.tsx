"use client";

import { useEffect, useRef, useState } from "react";
import { useWaitlist } from "./waitlist-context";
import { WaitlistForm } from "./waitlist-form";
import { useLanguage } from "./language-provider";
import { translations } from "@/lib/translations";

type FormState = "idle" | "submitting" | "success" | "error";

export function WaitlistModal() {
  const { isOpen, closeWaitlist } = useWaitlist();
  const { language } = useLanguage();
  const [formState, setFormState] = useState<FormState>("idle");
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  // Focus email when modal opens
  useEffect(() => {
    if (isOpen) {
      const focusEmail = () => emailInputRef.current?.focus({ preventScroll: true });
      const t = setTimeout(focusEmail, 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // ESC: close only if not submitting
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && formState !== "submitting") {
        closeWaitlist();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, formState, closeWaitlist]);

  const isSubmitting = formState === "submitting";
  const handleOverlayClick = () => {
    if (!isSubmitting) closeWaitlist();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (process.env.NODE_ENV !== "production") {
          console.log("[waitlist] modal click target=", e.target);
        }
        handleOverlayClick();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-modal-title"
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => !isSubmitting && closeWaitlist()}
          disabled={isSubmitting}
          aria-label={translations.waitlist.modal.close[language]}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-klozd-gray-600 hover:bg-klozd-gray-100 focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:ring-offset-2 transition disabled:opacity-50 disabled:pointer-events-none"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-3 pr-10">
          <h2 id="waitlist-modal-title" className="text-2xl font-bold text-klozd-black">
            {translations.waitlist.modal.title[language]}
          </h2>
          <p className="mt-2 text-sm leading-6 text-klozd-gray-600">
            {translations.waitlist.modal.description[language]}
          </p>
        </div>

        <WaitlistForm
          onSuccess={closeWaitlist}
          onStateChange={setFormState}
          emailInputRef={emailInputRef}
        />
      </div>
    </div>
  );
}
