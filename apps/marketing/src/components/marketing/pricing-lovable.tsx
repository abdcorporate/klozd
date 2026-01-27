"use client";

import { useState } from "react";
import { useLanguage } from "./language-provider";
import { translations } from "@/lib/translations";
import { Button } from "@/components/ui/button";

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export function PricingLovable() {
  const { language } = useLanguage();
  const [isYearly, setIsYearly] = useState(false);
  const pricing = translations.pricing;

  const handleWaitlistClick = () => {
    window.location.href = "#waitlist";
  };

  return (
    <section id="pricing" className="section-padding bg-white">
      <div className="container-klozd">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="tag-badge mb-4 inline-block">
              {pricing.badge[language]}
            </div>
            <h2 className="headline-section mb-4">
              {pricing.headline[language]}{" "}
              <span className="text-klozd-yellow">{pricing.headlineSub[language]}</span>
            </h2>
            <p className="body-normal mb-8">
              {pricing.description[language]}
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  !isYearly
                    ? "bg-klozd-black text-white"
                    : "bg-klozd-gray-100 text-klozd-gray-600"
                }`}
              >
                {pricing.monthly[language]}
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  isYearly
                    ? "bg-klozd-black text-white"
                    : "bg-klozd-gray-100 text-klozd-gray-600"
                }`}
              >
                {pricing.yearly[language]} <span className="text-klozd-yellow">{pricing.yearlyDiscount[language]}</span>
              </button>
            </div>
            {isYearly && (
              <p className="text-sm text-klozd-gray-600 mb-8">
                {pricing.billedYearly[language]}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricing.plans[language].map((plan, index) => {
              const isPopular = 'isPopular' in plan && plan.isPopular === true;
              return (
              <div
                key={index}
                className={isPopular ? "card-pricing-popular" : "card-pricing"}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-klozd-yellow text-klozd-black px-4 py-1 rounded-full text-sm font-semibold">
                    POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-klozd-black mb-2">{plan.name}</h3>
                  <p className="text-klozd-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-klozd-black">
                      {formatNumber(isYearly ? plan.price.yearly : plan.price.monthly)}€
                    </span>
                    <span className="text-klozd-gray-600">/mois</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-klozd-yellow flex-shrink-0 mt-0.5"
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
                      <span className="text-klozd-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={handleWaitlistClick}
                  className={`w-full ${
                    isPopular ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  {pricing.cta[language]}
                </Button>
              </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-klozd-gray-600">
              {pricing.earlyBird[language]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
