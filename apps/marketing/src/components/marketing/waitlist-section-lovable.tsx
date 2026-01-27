"use client";

import { useLanguage } from "./language-provider";
import { translations } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { useWaitlist } from "./waitlist-context";

export function WaitlistSectionLovable() {
  const { language } = useLanguage();
  const { openWaitlist } = useWaitlist();
  const finalCta = translations.finalCta;

  const handleWaitlistClick = () => {
    openWaitlist();
  };

  return (
    <section id="waitlist" className="section-padding bg-gradient-to-br from-klozd-black to-klozd-gray-900 text-white">
      <div className="container-klozd">
        <div className="max-w-3xl mx-auto text-center">
          <div className="tag-badge mb-6 inline-block bg-klozd-yellow/20 text-klozd-yellow border-klozd-yellow/30">
            {finalCta.badge[language]}
          </div>
          <h2 className="headline-section mb-6 text-white">
            {finalCta.headline[language]}{" "}
            <span className="text-klozd-yellow">{finalCta.headlineSub[language]}</span>
          </h2>
          <p className="body-large mb-8 text-white/80">
            {finalCta.description[language]}
          </p>
          <div className="mb-8">
            <Button
              onClick={handleWaitlistClick}
              className="btn-primary bg-klozd-yellow text-klozd-black hover:bg-klozd-yellow/90"
            >
              {finalCta.cta[language]}
            </Button>
            <p className="text-sm text-white/60 mt-4">
              {finalCta.noCreditCard[language]}
            </p>
          </div>
          <div className="text-sm text-white/60">
            <span className="font-semibold text-white">{finalCta.joinCount[language]} 500+</span>{" "}
            {finalCta.entrepreneurs[language]}
          </div>
        </div>
      </div>
    </section>
  );
}
