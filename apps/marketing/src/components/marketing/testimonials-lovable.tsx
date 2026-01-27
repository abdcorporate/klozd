"use client";

import { useLanguage } from "./language-provider";
import { translations } from "@/lib/translations";

export function TestimonialsLovable() {
  const { language } = useLanguage();
  const testimonials = translations.testimonials;

  return (
    <section className="section-padding bg-white">
      <div className="container-klozd">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="tag-badge mb-4 inline-block">
            {testimonials.badge[language]}
          </div>
          <h2 className="headline-section mb-4">
            {testimonials.headline[language]}{" "}
            <span className="text-klozd-yellow">{testimonials.headlineSub[language]}</span>
          </h2>
          <p className="body-normal mb-4">
            {testimonials.description[language]}
          </p>
          <p className="text-sm text-klozd-gray-600">
            {testimonials.waitlistCount[language]}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.items[language].map((testimonial, index) => (
            <div
              key={index}
              className="bg-klozd-gray-100 rounded-2xl p-6 border border-border"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-klozd-yellow"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-klozd-gray-600 mb-6 italic">
                "{testimonial.quote}"
              </p>
              <div>
                <div className="font-semibold text-klozd-black mb-1">
                  {testimonial.name}
                </div>
                <div className="text-sm text-klozd-gray-600">
                  {testimonial.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
