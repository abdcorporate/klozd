"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "./language-provider";
import { translations } from "@/lib/translations";

const waitlistSchema = z.object({
  email: z.string().min(1, "Email requis").email("Email invalide"),
  firstName: z.string().optional(),
  role: z.string().optional(),
  leadVolumeRange: z.string().optional(),
  teamSize: z.string().optional(),
  revenue: z.string().optional(),
  honeypot: z.string().optional(),
  formRenderedAt: z.string().optional(),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

type FormState = "idle" | "submitting" | "success" | "error";

interface WaitlistFormProps {
  onSuccess?: () => void;
  onStateChange?: (state: FormState) => void;
  emailInputRef?: React.RefObject<HTMLInputElement | null>;
}

function parseApiMessage(body: unknown): string | undefined {
  if (body === null || typeof body !== "object") return undefined;
  const o = body as Record<string, unknown>;
  const m = o.message;
  if (typeof m === "string") return m;
  if (Array.isArray(m) && m.length > 0 && typeof m[0] === "string") return m[0];
  return undefined;
}

export function WaitlistForm({ onSuccess, onStateChange, emailInputRef }: WaitlistFormProps) {
  const { language } = useLanguage();
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [formRenderedAt] = useState(new Date().toISOString());

  const t = translations.waitlist;
  const tModal = t.modal;

  useEffect(() => {
    onStateChange?.(formState);
  }, [formState, onStateChange]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[waitlist] mounted");
    }
  }, []);

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    mode: "onSubmit",
    defaultValues: {
      honeypot: "",
      formRenderedAt: formRenderedAt,
    },
  });

  const onInvalid = (errs: FieldErrors<WaitlistFormData>) => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[waitlist] submit invalid", errs);
    }
    // Inline errors only — no global banner; focus first invalid field
    if (errs.email) setFocus("email");
    else if (emailInputRef?.current) emailInputRef.current.focus({ preventScroll: true });
  };

  const onSubmit = async (data: WaitlistFormData) => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[waitlist] submit", { email: data.email });
    }
    setFormState("submitting");
    setErrorMessage("");
    setSuccessMessage("");
    setAlreadyJoined(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const urlParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
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

    try {
      const response = await fetch(`${apiUrl}/public/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await response.json().catch(() => ({}));

      if (response.ok) {
        const msg = parseApiMessage(json) ?? t.form.success[language];
        setSuccessMessage(msg);
        setAlreadyJoined(!!(json as { alreadyJoined?: boolean }).alreadyJoined);
        setFormState("success");
        setTimeout(() => onSuccess?.(), 1500);
      } else {
        if (response.status === 429) {
          setErrorMessage(tModal.errorRateLimit[language]);
        } else if (response.status === 400) {
          setErrorMessage(parseApiMessage(json) ?? tModal.errorEmailInvalid[language]);
        } else {
          setErrorMessage(parseApiMessage(json) ?? tModal.errorGeneric[language]);
        }
        setFormState("error");
      }
    } catch {
      setErrorMessage(tModal.errorNetwork[language]);
      setFormState("error");
    }
  };

  const handleOk = () => {
    onSuccess?.();
  };

  // —— Success screen ——
  if (formState === "success") {
    return (
      <div className="text-center py-8" role="status" aria-live="polite" aria-atomic="true">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-klozd-black mb-2">
          {tModal.successInscription[language]}
        </h3>
        <p className="text-klozd-gray-600 mb-2">{successMessage}</p>
        {alreadyJoined && (
          <p className="text-klozd-gray-600 text-sm mb-4" role="status">{tModal.alreadyJoinedBody[language]}</p>
        )}
        <button
          type="button"
          onClick={handleOk}
          className="h-12 px-8 rounded-xl bg-klozd-black text-white font-medium shadow-lg transition hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:ring-offset-2"
        >
          {tModal.okButton[language]}
        </button>
      </div>
    );
  }

  // —— Idle / Error: form ——
  const { ref: rhfEmailRef, ...emailRest } = register("email");
  const busy = formState === "submitting" || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="grid grid-cols-2 gap-x-8 gap-y-5"
      noValidate
    >
      <input type="text" {...register("honeypot")} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <input type="hidden" {...register("formRenderedAt")} />

      {/* Removed global error banner: inline errors only */}

      <div className="space-y-2 mb-4 pr-4">
        <label htmlFor="waitlist-email" className="block text-sm font-medium text-klozd-black leading-tight">
          {t.form.email[language]} <span className="text-red-500">*</span>
        </label>
        <input
          id="waitlist-email"
          type="email"
          {...emailRest}
          ref={(el) => {
            rhfEmailRef(el);
            if (emailInputRef) (emailInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
          }}
          placeholder={t.form.emailPlaceholder[language]}
          disabled={busy}
          autoComplete="email"
          className={`h-12 w-full rounded-xl border px-4 text-[15px] leading-[48px] text-klozd-black placeholder:text-klozd-gray-400 focus:outline-none focus:ring-2 transition disabled:opacity-70 ${
            errors.email
              ? "border-red-500 bg-red-50/50 focus:ring-red-500 focus:border-red-500"
              : "border-klozd-gray-400 bg-white focus:ring-klozd-yellow focus:border-klozd-yellow"
          }`}
          aria-invalid={!!errors.email || (formState === "error" && !!errorMessage)}
          aria-describedby={errors.email || (formState === "error" && errorMessage) ? "waitlist-email-err" : undefined}
        />
        {((errors.email?.message != null) || (formState === "error" && errorMessage)) && (
          <p id="waitlist-email-err" className="text-xs text-klozd-gray-600 mt-1" role="alert" aria-live="polite">
            {String(
              errors.email?.message === "Email requis" || errors.email?.message === "Email invalide"
                ? t.form.validationEmail[language]
                : (errors.email?.message ?? errorMessage)
            )}
          </p>
        )}
      </div>

      <div className="space-y-2 mb-4 pl-4">
        <label htmlFor="firstName" className="block text-sm font-medium text-klozd-black leading-tight">
          {t.form.fullName[language]}
        </label>
        <input
          id="firstName"
          type="text"
          {...register("firstName")}
          placeholder={t.form.namePlaceholder[language]}
          disabled={busy}
          className="h-12 w-full rounded-xl border border-klozd-gray-400 bg-white px-4 text-[15px] leading-[48px] text-klozd-black placeholder:text-klozd-gray-400 focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:border-klozd-yellow transition disabled:opacity-70"
        />
      </div>

      <div className="space-y-2 mb-4 pr-4">
        <label htmlFor="role" className="block text-sm font-medium text-klozd-black leading-tight">
          {t.form.industry[language]}
        </label>
        <select
          id="role"
          {...register("role")}
          disabled={busy}
          className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-4 pr-10 text-[15px] text-klozd-black appearance-none cursor-pointer hover:border-klozd-yellow/50 focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:border-klozd-yellow focus:bg-white transition-all duration-200 disabled:opacity-70"
        >
          <option value="">{t.form.selectIndustry[language]}</option>
          <option value="it">{t.industries.it[language]}</option>
          <option value="real-estate">{t.industries.realEstate[language]}</option>
          <option value="finance">{t.industries.finance[language]}</option>
          <option value="coaching">{t.industries.coaching[language]}</option>
          <option value="ecommerce">{t.industries.ecommerce[language]}</option>
          <option value="health">{t.industries.health[language]}</option>
          <option value="automotive">{t.industries.automotive[language]}</option>
          <option value="construction">{t.industries.construction[language]}</option>
          <option value="consulting">{t.industries.consulting[language]}</option>
          <option value="other">{t.industries.other[language]}</option>
        </select>
      </div>

      <div className="space-y-2 mb-4 pl-4">
        <label htmlFor="teamSize" className="block text-sm font-medium text-klozd-black leading-tight">
          {t.form.teamSize[language]}
        </label>
        <select
          id="teamSize"
          {...register("teamSize")}
          disabled={busy}
          className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-4 pr-10 text-[15px] text-klozd-black appearance-none cursor-pointer hover:border-klozd-yellow/50 focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:border-klozd-yellow focus:bg-white transition-all duration-200 disabled:opacity-70"
        >
          <option value="">{t.form.selectTeamSize[language]}</option>
          <option value="1">{t.teamSizes.one[language]}</option>
          <option value="2-5">{t.teamSizes.twoFive[language]}</option>
          <option value="6-10">{t.teamSizes.sixTen[language]}</option>
          <option value="11-20">{t.teamSizes.elevenTwenty[language]}</option>
          <option value="20+">{t.teamSizes.twentyPlus[language]}</option>
        </select>
      </div>

      <div className="space-y-2 mb-4 pr-4">
        <label htmlFor="leadVolumeRange" className="block text-sm font-medium text-klozd-black leading-tight">
          {t.form.leadVolume[language]}
        </label>
        <select
          id="leadVolumeRange"
          {...register("leadVolumeRange")}
          disabled={busy}
          className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-4 pr-10 text-[15px] text-klozd-black appearance-none cursor-pointer hover:border-klozd-yellow/50 focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:border-klozd-yellow focus:bg-white transition-all duration-200 disabled:opacity-70"
        >
          <option value="">{t.form.selectVolume[language]}</option>
          <option value="0-50">{t.leadVolumes.zeroFifty[language]}</option>
          <option value="50-200">{t.leadVolumes.fiftyTwoHundred[language]}</option>
          <option value="200-500">{t.leadVolumes.twoHundredFiveHundred[language]}</option>
          <option value="500+">{t.leadVolumes.fiveHundredPlus[language]}</option>
        </select>
      </div>

      <div className="space-y-2 mb-4 pl-4">
        <label htmlFor="revenue" className="block text-sm font-medium text-klozd-black leading-tight">
          {t.form.revenue[language]}
        </label>
        <select
          id="revenue"
          {...register("revenue")}
          disabled={busy}
          className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-4 pr-10 text-[15px] text-klozd-black appearance-none cursor-pointer hover:border-klozd-yellow/50 focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:border-klozd-yellow focus:bg-white transition-all duration-200 disabled:opacity-70"
        >
          <option value="">{t.form.selectRevenue[language]}</option>
          <option value="0-50k">{t.revenues.zeroFiftyK[language]}</option>
          <option value="50k-200k">{t.revenues.fiftyKTwoHundredK[language]}</option>
          <option value="200k-500k">{t.revenues.twoHundredKFiveHundredK[language]}</option>
          <option value="500k-1M">{t.revenues.fiveHundredKOneM[language]}</option>
          <option value="1M+">{t.revenues.oneMPlus[language]}</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={busy}
        onClick={() => {
          if (process.env.NODE_ENV !== "production") {
            console.log("[waitlist] click submit");
          }
        }}
        className="col-span-2 h-12 w-full rounded-xl bg-klozd-yellow px-5 text-base font-medium text-klozd-black shadow-lg transition hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-klozd-yellow focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        {busy ? (
          <>
            <span className="inline-block w-5 h-5 border-2 border-klozd-black border-t-transparent rounded-full animate-spin" aria-hidden />
            <span>{t.form.submitting[language]}</span>
          </>
        ) : (
          t.form.submit[language]
        )}
      </button>

      <p className="col-span-2 text-center text-xs text-klozd-gray-600 mt-4">
        {t.form.disclaimer[language]}
      </p>
    </form>
  );
}
