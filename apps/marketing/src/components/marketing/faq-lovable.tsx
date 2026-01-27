"use client";

import { useState } from "react";
import { useLanguage } from "./language-provider";
import { translations } from "@/lib/translations";

export function FAQLovable() {
  const { language } = useLanguage();
  const faq = translations.faq;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section-padding bg-klozd-gray-100">
      <div className="container-klozd">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="headline-section mb-4">
              {faq.headline[language]}
            </h2>
          </div>

          <div className="space-y-4">
            {faq.items[language].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-klozd-gray-100 transition-colors"
                >
                  <span className="font-semibold text-klozd-black pr-4">
                    {item.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-klozd-gray-600 flex-shrink-0 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-klozd-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
