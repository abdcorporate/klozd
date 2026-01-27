"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "./language-provider";
import { translations } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { MockupImage } from "./mockup-image";

interface HeroLovableProps {
  onOpenWaitlist?: () => void;
}

export function HeroLovable({ onOpenWaitlist }: HeroLovableProps = {}) {
  const { language } = useLanguage();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const hero = translations.hero;

  const rotatingWords = hero.rotatingWords[language];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  const handleWaitlistClick = () => {
    if (onOpenWaitlist) {
      onOpenWaitlist();
    } else {
      window.location.href = "#waitlist";
    }
  };

  const handleCalculatorClick = () => {
    window.location.href = "#calculator";
  };

  return (
    <section className="min-h-screen flex items-center pt-20 md:pt-0 overflow-hidden bg-gradient-to-b from-klozd-gray-100 to-white">
      <div className="container-klozd">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="tag-badge mb-6 inline-block">
              {hero.badge[language]}
            </div>

            <h1 className="headline-hero mb-6">
              {hero.headline1[language]}{" "}
              <span className="text-klozd-yellow">{hero.headline2[language]}</span>
            </h1>

            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-klozd-black mb-6">
              {hero.rotatingPrefix[language]}{" "}
              <span className="text-klozd-yellow inline-block min-w-[200px]">
                {rotatingWords[currentWordIndex]}
              </span>
            </div>

            <p className="body-large mb-8 max-w-xl mx-auto lg:mx-0">
              {hero.subheadline[language]}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button onClick={handleWaitlistClick} className="btn-primary">
                {hero.ctaPrimary[language]}
              </Button>
              <Button onClick={handleCalculatorClick} className="btn-secondary">
                {hero.ctaSecondary[language]}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-klozd-black mb-1">
                  {hero.stats.setup[language]}
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-klozd-black mb-1">
                  {hero.stats.saved[language]}
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-klozd-black mb-1">
                  {hero.stats.price[language]}
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="mockup-shadow rounded-2xl overflow-hidden">
              <MockupImage
                src="/assets/mockup-dashboard-BVSFSSnl.png"
                alt="KLOZD Dashboard"
                width={800}
                height={600}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
