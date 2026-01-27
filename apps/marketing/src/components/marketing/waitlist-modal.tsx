"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { WaitlistForm } from "./waitlist-form";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset success state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
    }
  }, [isOpen]);

  const handleSuccess = () => {
    setIsSuccess(true);
    // Auto-close after 3 seconds on success
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={!isSuccess ? "Rejoindre la liste d'attente" : undefined}
    >
      <div className="relative">
        {isSuccess ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center animate-scale-in">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 animate-fade-in-up">
              Merci pour votre inscription ! 🎉
            </h3>
            <p className="text-lg text-muted-foreground mb-6 animate-fade-in-up delay-200">
              Nous vous contacterons dès que KLOZD sera disponible. Restez connecté !
            </p>
            <p className="text-sm text-muted-foreground animate-fade-in delay-300">
              Cette fenêtre se fermera automatiquement...
            </p>
          </div>
        ) : (
          <WaitlistForm onSuccess={handleSuccess} />
        )}
      </div>
    </Modal>
  );
}
