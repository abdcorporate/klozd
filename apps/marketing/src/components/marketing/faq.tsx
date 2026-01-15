"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

const faqs = [
  {
    question: "Qu'est-ce que KLOZD ?",
    answer:
      "KLOZD est une plateforme SaaS complète pour infopreneurs et équipes de closing. Elle combine gestion de leads, formulaires intelligents, planification de rendez-vous, CRM et visioconférence native en une seule solution.",
  },
  {
    question: "Combien coûte KLOZD ?",
    answer:
      "Les tarifs seront communiqués lors du lancement. Rejoignez la liste d'attente pour être informé en priorité et bénéficier d'offres spéciales de lancement.",
  },
  {
    question: "KLOZD est-il sécurisé ?",
    answer:
      "Absolument. KLOZD utilise les meilleures pratiques de sécurité : isolation multi-tenant, audit logs complets, chiffrement des données, authentification sécurisée avec refresh tokens, et conformité RGPD.",
  },
  {
    question: "Puis-je essayer KLOZD avant de m'engager ?",
    answer:
      "Oui, nous proposerons une période d'essai gratuite lors du lancement. Rejoignez la liste d'attente pour être parmi les premiers à y accéder.",
  },
  {
    question: "KLOZD fonctionne-t-il sur mobile ?",
    answer:
      "Oui, KLOZD est entièrement responsive et fonctionne parfaitement sur mobile, tablette et desktop. L'interface s'adapte à tous les écrans.",
  },
  {
    question: "Quelle est la différence avec les autres solutions ?",
    answer:
      "KLOZD combine tous les outils nécessaires en une seule plateforme : pas besoin d'intégrer Calendly, Zoom, HubSpot, etc. Tout est intégré nativement avec une expérience utilisateur cohérente.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Questions fréquentes
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 leading-relaxed">
            Tout ce que vous devez savoir sur KLOZD
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card 
              key={index}
              className="overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left flex items-start justify-between gap-4 group py-1"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <h3 className="text-lg md:text-xl font-semibold text-slate-900 leading-snug group-hover:text-brand-orange transition-colors duration-300">
                  {faq.question}
                </h3>
                <span 
                  className={`text-2xl text-slate-400 flex-shrink-0 transition-all duration-300 group-hover:text-slate-600 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                >
                  +
                </span>
              </button>
              <div
                id={`faq-answer-${index}`}
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index 
                    ? 'max-h-96 opacity-100 mt-4' 
                    : 'max-h-0 opacity-0'
                }`}
                role="region"
              >
                <p className="text-slate-600 leading-relaxed pb-2">
                  {faq.answer}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
