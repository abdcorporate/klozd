"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "./language-provider";
import { Button } from "@/components/ui/button";

const waitlistSchema = z.object({
  email: z.string().email("Email invalide"),
  firstName: z.string().optional(),
  role: z.string().optional(),
  leadVolumeRange: z.string().optional(),
  teamSize: z.string().optional(),
  revenue: z.string().optional(),
  honeypot: z.string().optional(),
  formRenderedAt: z.string().optional(),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

interface WaitlistFormProps {
  onSuccess?: () => void;
}

export function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [formRenderedAt] = useState(new Date().toISOString());

  // Extraire les paramètres UTM de l'URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      // Les paramètres UTM seront envoyés automatiquement si présents dans l'URL
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      honeypot: "",
      formRenderedAt: formRenderedAt,
    },
  });

  const onSubmit = async (data: WaitlistFormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    try {
      const urlParams = new URLSearchParams(window.location.search);
      
      const payload = {
        email: data.email,
        firstName: data.firstName || undefined,
        role: data.role || undefined,
        leadVolumeRange: data.leadVolumeRange || undefined,
        teamSize: data.teamSize || undefined,
        revenue: data.revenue || undefined,
        honeypot: data.honeypot || "",
        formRenderedAt: data.formRenderedAt || formRenderedAt,
        utmSource: urlParams.get("utm_source") || undefined,
        utmMedium: urlParams.get("utm_medium") || undefined,
        utmCampaign: urlParams.get("utm_campaign") || undefined,
      };

      const response = await fetch(`${apiUrl}/public/waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmitStatus("success");
        reset();
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error submitting waitlist:", response.status, errorData);
        setSubmitStatus("error");
      }
    } catch (error: any) {
      console.error("Error submitting waitlist:", error);
      // Vérifier si c'est une erreur de connexion
      if (error?.message?.includes("Failed to fetch") || error?.name === "TypeError") {
        console.error("API server is not accessible. Make sure the API is running on", apiUrl);
      }
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === "success") {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-klozd-black mb-2">
          {language === "fr" ? "Inscription réussie !" : "Successfully registered!"}
        </h3>
        <p className="text-klozd-gray-600">
          {language === "fr"
            ? "Nous vous recontacterons bientôt."
            : "We'll contact you soon."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
      {/* Honeypot field - invisible pour les bots */}
      <input
        type="text"
        {...register("honeypot")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <input type="hidden" {...register("formRenderedAt")} />

      {/* Email (full) */}
      <div className="sm:col-span-2 space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-klozd-black leading-tight">
          {language === "fr" ? "Email" : "Email"} <span className="text-klozd-yellow">*</span>
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          required
          placeholder={language === "fr" ? "votre@email.com" : "your@email.com"}
          className="block h-12 w-full rounded-xl border border-klozd-gray-400 bg-white px-4 text-klozd-black placeholder:text-klozd-gray-400 focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:border-klozd-yellow transition"
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Prénom (full) */}
      <div className="sm:col-span-2 space-y-2">
        <label htmlFor="firstName" className="block text-sm font-medium text-klozd-black leading-tight">
          {language === "fr" ? "Prénom" : "First Name"}
        </label>
        <input
          id="firstName"
          type="text"
          {...register("firstName")}
          placeholder={language === "fr" ? "Jean" : "John"}
          className="block h-12 w-full rounded-xl border border-klozd-gray-400 bg-white px-4 text-klozd-black placeholder:text-klozd-gray-400 focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:border-klozd-yellow transition"
        />
      </div>

      {/* Secteur */}
      <div className="space-y-2">
        <label htmlFor="role" className="block text-sm font-medium text-klozd-black leading-tight">
          {language === "fr" ? "Secteur d'activités" : "Industry"}
        </label>
        <div className="relative">
          <select
            id="role"
            {...register("role")}
            className="block h-12 w-full rounded-xl border border-klozd-gray-400 bg-white px-4 pr-11 text-klozd-black appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:border-klozd-yellow transition"
          >
            <option value="">
              {language === "fr" ? "Sélectionner un secteur" : "Select an industry"}
            </option>
            <option value="it">{language === "fr" ? "IT / Technologie" : "IT / Technology"}</option>
            <option value="real-estate">{language === "fr" ? "Immobilier" : "Real Estate"}</option>
            <option value="finance">{language === "fr" ? "Finance / Assurance" : "Finance / Insurance"}</option>
            <option value="coaching">{language === "fr" ? "Coaching / Formation" : "Coaching / Training"}</option>
            <option value="ecommerce">{language === "fr" ? "E-commerce / Retail" : "E-commerce / Retail"}</option>
            <option value="health">{language === "fr" ? "Santé / Bien-être" : "Health / Wellness"}</option>
            <option value="automotive">{language === "fr" ? "Automobile" : "Automotive"}</option>
            <option value="construction">{language === "fr" ? "BTP / Construction" : "Construction"}</option>
            <option value="consulting">{language === "fr" ? "Conseil / Services" : "Consulting / Services"}</option>
            <option value="other">{language === "fr" ? "Autre" : "Other"}</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-klozd-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>

      {/* Équipe */}
      <div className="space-y-2">
        <label htmlFor="teamSize" className="block text-sm font-medium text-klozd-black leading-tight">
          {language === "fr" ? "Équipe" : "Team Size"}
        </label>
        <div className="relative">
          <select
            id="teamSize"
            {...register("teamSize")}
            className="block h-12 w-full rounded-xl border border-klozd-gray-400 bg-white px-4 pr-11 text-klozd-black appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:border-klozd-yellow transition"
          >
            <option value="">
              {language === "fr" ? "Sélectionner une taille" : "Select a size"}
            </option>
            <option value="1">{language === "fr" ? "1 personne" : "1 person"}</option>
            <option value="2-5">{language === "fr" ? "2 - 5 personnes" : "2 - 5 people"}</option>
            <option value="6-10">{language === "fr" ? "6 - 10 personnes" : "6 - 10 people"}</option>
            <option value="11-20">{language === "fr" ? "11 - 20 personnes" : "11 - 20 people"}</option>
            <option value="20+">{language === "fr" ? "20+ personnes" : "20+ people"}</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-klozd-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>

      {/* Leads */}
      <div className="space-y-2">
        <label htmlFor="leadVolumeRange" className="block text-sm font-medium text-klozd-black leading-tight">
          {language === "fr" ? "Volume de leads mensuel" : "Monthly Lead Volume"}
        </label>
        <div className="relative">
          <select
            id="leadVolumeRange"
            {...register("leadVolumeRange")}
            className="block h-12 w-full rounded-xl border border-klozd-gray-400 bg-white px-4 pr-11 text-klozd-black appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:border-klozd-yellow transition"
          >
            <option value="">
              {language === "fr" ? "Sélectionner un volume" : "Select a volume"}
            </option>
            <option value="0-50">{language === "fr" ? "0 - 50 leads/mois" : "0 - 50 leads/month"}</option>
            <option value="50-200">{language === "fr" ? "50 - 200 leads/mois" : "50 - 200 leads/month"}</option>
            <option value="200-500">{language === "fr" ? "200 - 500 leads/mois" : "200 - 500 leads/month"}</option>
            <option value="500+">{language === "fr" ? "500+ leads/mois" : "500+ leads/month"}</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-klozd-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>

      {/* CA */}
      <div className="space-y-2">
        <label htmlFor="revenue" className="block text-sm font-medium text-klozd-black leading-tight">
          {language === "fr" ? "Chiffre d'affaires mensuel" : "Monthly Revenue"}
        </label>
        <div className="relative">
          <select
            id="revenue"
            {...register("revenue")}
            className="block h-12 w-full rounded-xl border border-klozd-gray-400 bg-white px-4 pr-11 text-klozd-black appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:border-klozd-yellow transition"
          >
            <option value="">
              {language === "fr" ? "Sélectionner un CA" : "Select revenue"}
            </option>
            <option value="0-50k">{language === "fr" ? "0 - 50k€" : "0 - 50k€"}</option>
            <option value="50k-200k">{language === "fr" ? "50k - 200k€" : "50k - 200k€"}</option>
            <option value="200k-500k">{language === "fr" ? "200k - 500k€" : "200k - 500k€"}</option>
            <option value="500k-1M">{language === "fr" ? "500k - 1M€" : "500k - 1M€"}</option>
            <option value="1M+">{language === "fr" ? "1M€+" : "1M€+"}</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-klozd-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>

      {/* Error message */}
      {submitStatus === "error" && (
        <div className="sm:col-span-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600 font-medium mb-1">
            {language === "fr"
              ? "Erreur de connexion"
              : "Connection error"}
          </p>
          <p className="text-xs text-red-500">
            {language === "fr"
              ? "Impossible de se connecter au serveur. Vérifiez que l'API est démarrée sur http://localhost:3001"
              : "Unable to connect to server. Please check that the API is running on http://localhost:3001"}
          </p>
        </div>
      )}

      {/* CTA */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="sm:col-span-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-base font-medium text-primary-foreground shadow-lg transition hover:bg-primary/90 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
      >
        {isSubmitting
          ? language === "fr"
            ? "Inscription en cours..."
            : "Submitting..."
          : language === "fr"
          ? "Rejoindre la Waitlist"
          : "Join the Waitlist"}
      </button>

      <p className="sm:col-span-2 text-center text-xs text-klozd-gray-600">
        {language === "fr"
          ? "En vous inscrivant, vous acceptez d'être recontacté. Aucun spam."
          : "By signing up, you agree to be contacted. No spam."}
      </p>
    </form>
  );
}
