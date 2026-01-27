"use client";

import { useLanguage } from "./language-provider";
import { translations } from "@/lib/translations";

export function ComparisonLovable() {
  const { language } = useLanguage();
  const comparison = translations.comparison;

  return (
    <section className="section-padding bg-klozd-gray-100">
      <div className="container-klozd">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="tag-badge mb-4 inline-block">
            {comparison.badge[language]}
          </div>
          <h2 className="headline-section mb-4">
            {comparison.headline[language]}{" "}
            <span className="text-klozd-yellow">{comparison.headlineSub[language]}</span>
          </h2>
          <p className="body-normal">
            {comparison.description[language]}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-border">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-lg font-semibold text-klozd-black mb-6">
                {comparison.featureLabel[language]}
              </h3>
              <ul className="space-y-4">
                {comparison.items[language].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-klozd-yellow flex-shrink-0 mt-0.5"
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
                    <span className="text-klozd-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-klozd-black mb-6">
                {comparison.traditionalLabel[language]}
              </h3>
              <ul className="space-y-4">
                {comparison.items[language].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span className="text-klozd-gray-600 line-through">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-klozd-black mb-2">
                {comparison.stats.time.value}
              </div>
              <div className="text-sm text-klozd-gray-600">
                {comparison.stats.time.label[language]}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-klozd-black mb-2">
                {comparison.stats.show.value}
              </div>
              <div className="text-sm text-klozd-gray-600">
                {comparison.stats.show.label[language]}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-klozd-black mb-2">
                {comparison.stats.closing.value}
              </div>
              <div className="text-sm text-klozd-gray-600">
                {comparison.stats.closing.label[language]}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-klozd-black mb-2">
                {comparison.stats.savings.value}
              </div>
              <div className="text-sm text-klozd-gray-600">
                {comparison.stats.savings.label[language]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
