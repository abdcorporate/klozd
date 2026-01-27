"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "./language-provider";
import { translations } from "@/lib/translations";
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
          {translations.waitlist.form.success[language]}
        </h3>
        <p className="text-klozd-gray-600">
          {translations.waitlist.form.successMessage[language]}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-x-8 gap-y-5">
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

      {/* Email */}
      <div className="space-y-2 mb-4 pr-4">
        <label htmlFor="email" className="block text-sm font-medium text-klozd-black leading-tight">
          {translations.waitlist.form.email[language]} <span className="text-klozd-yellow">*</span>
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          required
          placeholder={translations.waitlist.form.emailPlaceholder[language]}
          className="h-12 w-full rounded-xl border border-klozd-gray-400 bg-white px-4 text-[15px] leading-[48px] text-klozd-black placeholder:text-klozd-gray-400 focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:border-klozd-yellow transition"
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Nom complet */}
      <div className="space-y-2 mb-4 pl-4">
        <label htmlFor="firstName" className="block text-sm font-medium text-klozd-black leading-tight">
          {translations.waitlist.form.fullName[language]}
        </label>
        <input
          id="firstName"
          type="text"
          {...register("firstName")}
          placeholder={translations.waitlist.form.namePlaceholder[language]}
          className="h-12 w-full rounded-xl border border-klozd-gray-400 bg-white px-4 text-[15px] leading-[48px] text-klozd-black placeholder:text-klozd-gray-400 focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:border-klozd-yellow transition"
        />
      </div>

      {/* Secteur */}
      <div className="space-y-2 mb-4 pr-4">
        <label htmlFor="role" className="block text-sm font-medium text-klozd-black leading-tight">
          {translations.waitlist.form.industry[language]}
        </label>
        <div className="relative">
          <select
            id="role"
            {...register("role")}
            className="h-12 w-full rounded-xl border border-klozd-gray-400 bg-white pl-4 pr-20 text-[15px] leading-[48px] text-klozd-black appearance-none focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:border-klozd-yellow transition"
            style={{ paddingRight: '5rem' }}
          >
            <option value="">
              {translations.waitlist.form.selectIndustry[language]}
            </option>
            <option value="it">{translations.waitlist.industries.it[language]}</option>
            <option value="real-estate">{translations.waitlist.industries.realEstate[language]}</option>
            <option value="finance">{translations.waitlist.industries.finance[language]}</option>
            <option value="coaching">{translations.waitlist.industries.coaching[language]}</option>
            <option value="ecommerce">{translations.waitlist.industries.ecommerce[language]}</option>
            <option value="health">{translations.waitlist.industries.health[language]}</option>
            <option value="automotive">{translations.waitlist.industries.automotive[language]}</option>
            <option value="construction">{translations.waitlist.industries.construction[language]}</option>
            <option value="consulting">{translations.waitlist.industries.consulting[language]}</option>
            <option value="other">{translations.waitlist.industries.other[language]}</option>
          </select>
        </div>
      </div>

      {/* Équipe */}
      <div className="space-y-2 mb-4 pl-4">
        <label htmlFor="teamSize" className="block text-sm font-medium text-klozd-black leading-tight">
          {translations.waitlist.form.teamSize[language]}
        </label>
        <div className="relative">
          <select
            id="teamSize"
            {...register("teamSize")}
            className="h-12 w-full rounded-xl border border-klozd-gray-400 bg-white pl-4 pr-20 text-[15px] leading-[48px] text-klozd-black appearance-none focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:border-klozd-yellow transition"
            style={{ paddingRight: '5rem' }}
          >
            <option value="">
              {translations.waitlist.form.selectTeamSize[language]}
            </option>
            <option value="1">{translations.waitlist.teamSizes.one[language]}</option>
            <option value="2-5">{translations.waitlist.teamSizes.twoFive[language]}</option>
            <option value="6-10">{translations.waitlist.teamSizes.sixTen[language]}</option>
            <option value="11-20">{translations.waitlist.teamSizes.elevenTwenty[language]}</option>
            <option value="20+">{translations.waitlist.teamSizes.twentyPlus[language]}</option>
          </select>
        </div>
      </div>

      {/* Volume */}
      <div className="space-y-2 mb-4 pr-4">
        <label htmlFor="leadVolumeRange" className="block text-sm font-medium text-klozd-black leading-tight">
          {translations.waitlist.form.leadVolume[language]}
        </label>
        <div className="relative">
          <select
            id="leadVolumeRange"
            {...register("leadVolumeRange")}
            className="h-12 w-full rounded-xl border border-klozd-gray-400 bg-white pl-4 pr-20 text-[15px] leading-[48px] text-klozd-black appearance-none focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:border-klozd-yellow transition"
            style={{ paddingRight: '5rem' }}
          >
            <option value="">
              {translations.waitlist.form.selectVolume[language]}
            </option>
            <option value="0-50">{translations.waitlist.leadVolumes.zeroFifty[language]}</option>
            <option value="50-200">{translations.waitlist.leadVolumes.fiftyTwoHundred[language]}</option>
            <option value="200-500">{translations.waitlist.leadVolumes.twoHundredFiveHundred[language]}</option>
            <option value="500+">{translations.waitlist.leadVolumes.fiveHundredPlus[language]}</option>
          </select>
        </div>
      </div>

      {/* CA */}
      <div className="space-y-2 mb-4 pl-4">
        <label htmlFor="revenue" className="block text-sm font-medium text-klozd-black leading-tight">
          {translations.waitlist.form.revenue[language]}
        </label>
        <div className="relative">
          <select
            id="revenue"
            {...register("revenue")}
            className="h-12 w-full rounded-xl border border-klozd-gray-400 bg-white pl-4 pr-20 text-[15px] leading-[48px] text-klozd-black appearance-none focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:border-klozd-yellow transition"
            style={{ paddingRight: '5rem' }}
          >
            <option value="">
              {translations.waitlist.form.selectRevenue[language]}
            </option>
            <option value="0-50k">{translations.waitlist.revenues.zeroFiftyK[language]}</option>
            <option value="50k-200k">{translations.waitlist.revenues.fiftyKTwoHundredK[language]}</option>
            <option value="200k-500k">{translations.waitlist.revenues.twoHundredKFiveHundredK[language]}</option>
            <option value="500k-1M">{translations.waitlist.revenues.fiveHundredKOneM[language]}</option>
            <option value="1M+">{translations.waitlist.revenues.oneMPlus[language]}</option>
          </select>
        </div>
      </div>

      {/* Error message */}
      {submitStatus === "error" && (
        <div className="col-span-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600 font-medium mb-1">
            {translations.waitlist.form.error[language]}
          </p>
          <p className="text-xs text-red-500">
            {translations.waitlist.form.errorMessage[language]}
          </p>
        </div>
      )}

      {/* CTA */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="col-span-2 h-12 w-full rounded-xl bg-klozd-yellow px-5 text-base font-medium text-klozd-black shadow-lg transition hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
      >
        {isSubmitting
          ? translations.waitlist.form.submitting[language]
          : translations.waitlist.form.submit[language]}
      </button>

      <p className="col-span-2 text-center text-xs text-klozd-gray-600 mt-4">
        {translations.waitlist.form.disclaimer[language]}
      </p>
    </form>
  );
}
