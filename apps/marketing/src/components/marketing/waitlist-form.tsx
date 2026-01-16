"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const waitlistSchema = z.object({
  email: z
    .string()
    .min(5, "Email trop court")
    .max(254, "Email trop long")
    .email("Email invalide")
    .toLowerCase()
    .trim()
    .refine(
      (email) => {
        // Validation supplémentaire côté client
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
      },
      { message: "Format d'email invalide" }
    )
    .refine(
      (email) => {
        // Rejeter les emails jetables connus
        const disposableDomains = [
          '10minutemail.com',
          'guerrillamail.com',
          'mailinator.com',
          'tempmail.com',
          'yopmail.com',
        ];
        const domain = email.split('@')[1]?.toLowerCase();
        return !disposableDomains.includes(domain || '');
      },
      { message: "Les emails temporaires ne sont pas autorisés" }
    ),
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(100, "Le prénom est trop long")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le prénom contient des caractères invalides")
    .optional()
    .or(z.literal('')),
  role: z
    .enum([
      'it',
      'real-estate',
      'finance',
      'coaching',
      'ecommerce',
      'health',
      'automotive',
      'construction',
      'consulting',
      'other',
    ], {
      message: "Secteur d'activités invalide",
    })
    .optional()
    .or(z.literal('')),
  leadVolumeRange: z
    .enum(['0-50', '50-200', '200-500', '500+'], {
      message: "Volume de leads invalide",
    })
    .optional()
    .or(z.literal('')),
  // Champs de sécurité
  honeypot: z.string().max(0, "Champ de sécurité invalide").optional().or(z.literal('')),
  formRenderedAt: z.string().optional(),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function WaitlistForm() {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [formRenderedAt] = useState(new Date().toISOString());

  // Capture UTM depuis querystring
  const utmSource = searchParams.get("utm_source") || undefined;
  const utmMedium = searchParams.get("utm_medium") || undefined;
  const utmCampaign = searchParams.get("utm_campaign") || undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  const onSubmit = async (data: WaitlistFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/public/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          firstName: data.firstName,
          role: data.role,
          leadVolumeRange: data.leadVolumeRange,
          utmSource,
          utmMedium,
          utmCampaign,
          honeypot: data.honeypot || "",
          formRenderedAt: formRenderedAt,
        }),
        // credentials: "include", // mets-le seulement si tu utilises vraiment des cookies
      });

      let responseData: any;
      try {
        responseData = await res.json();
      } catch (jsonError) {
        throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      }

      if (!res.ok) {
        throw new Error(Array.isArray(responseData.message) ? responseData.message.join(", ") : responseData.message || `Erreur ${res.status}`);
      }

      if (responseData.alreadyJoined) {
        setAlreadyJoined(true);
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="text-center py-12 md:py-16 border-2 border-primary/50 shadow-2xl bg-gradient-to-br from-card to-card/95 animate-scale-in">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center animate-scale-in delay-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up delay-300">
          {alreadyJoined
            ? "Vous êtes déjà inscrit ! 🎉"
            : "Merci pour votre inscription ! 🎉"}
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto animate-fade-in-up delay-400">
          {alreadyJoined
            ? "Vous êtes déjà dans notre liste d'attente. Nous vous contacterons dès que KLOZD sera disponible."
            : "Nous vous contacterons dès que KLOZD sera disponible. Restez connecté !"}
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-border/50 shadow-xl bg-gradient-to-br from-card to-card/95 backdrop-blur-sm p-8 md:p-10">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Honeypot field (invisible) */}
        <input
          type="text"
          {...register("honeypot")}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        {/* Hidden formRenderedAt */}
        <input
          type="hidden"
          {...register("formRenderedAt")}
          value={formRenderedAt}
        />

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-foreground mb-2"
          >
            Email <span className="text-primary">*</span>
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            required
            placeholder="votre@email.com"
            className="w-full px-4 py-3.5 border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-destructive flex items-center gap-1" role="alert" id="email-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-semibold text-foreground mb-2"
          >
            Prénom
          </label>
          <input
            {...register("firstName")}
            type="text"
            id="firstName"
            placeholder="Jean"
            className="w-full px-4 py-3.5 border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground"
            aria-invalid={errors.firstName ? "true" : "false"}
          />
          {errors.firstName && (
            <p className="mt-2 text-sm text-destructive flex items-center gap-1" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-semibold text-foreground mb-2"
            >
              Secteur d'activités
            </label>
            <select
              {...register("role")}
              id="role"
              className="w-full px-4 py-3.5 border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground appearance-none cursor-pointer"
            >
              <option value="">Sélectionner un secteur</option>
              <option value="it">IT / Technologie</option>
              <option value="real-estate">Immobilier</option>
              <option value="finance">Finance / Assurance</option>
              <option value="coaching">Coaching / Formation</option>
              <option value="ecommerce">E-commerce / Retail</option>
              <option value="health">Santé / Bien-être</option>
              <option value="automotive">Automobile</option>
              <option value="construction">BTP / Construction</option>
              <option value="consulting">Conseil / Services</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="leadVolumeRange"
              className="block text-sm font-semibold text-foreground mb-2"
            >
              Volume de leads mensuel
            </label>
            <select
              {...register("leadVolumeRange")}
              id="leadVolumeRange"
              className="w-full px-4 py-3.5 border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground appearance-none cursor-pointer"
            >
              <option value="">Sélectionner un volume</option>
              <option value="0-50">0 - 50 leads/mois</option>
              <option value="50-200">50 - 200 leads/mois</option>
              <option value="200-500">200 - 500 leads/mois</option>
              <option value="500+">500+ leads/mois</option>
            </select>
          </div>
        </div>

        {error && (
          <div
            className="p-4 bg-destructive/10 border-2 border-destructive/20 rounded-xl flex items-start gap-3"
            role="alert"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full h-12 text-lg rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FFC107] hover:from-[#FFC107] hover:to-[#FFA000] text-black font-bold shadow-xl hover:shadow-2xl hover:shadow-[#FFD700]/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
          disabled={isSubmitting}
        >
          <span className="relative z-10">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Inscription en cours...
              </span>
            ) : (
              "Réserver ma place"
            )}
          </span>
          {!isSubmitting && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          )}
        </Button>
      </form>
    </Card>
  );
}
