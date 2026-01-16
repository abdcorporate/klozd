"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

const faqs = [
  {
    question: "À quoi ressemble KLOZD ?",
    answer: "KLOZD est une interface moderne et intuitive qui centralise tous tes outils commerciaux. Tu retrouves un dashboard personnalisé selon ton rôle, un pipeline Kanban pour visualiser tes deals, des formulaires intelligents pour capturer tes leads, et un calendrier intégré pour gérer tes rendez-vous. Tout est accessible depuis une seule plateforme, sans avoir à jongler entre plusieurs applications.",
  },
  {
    question: "Comment fonctionne le suivi IA ?",
    answer: "Notre IA analyse le comportement de tes leads (pages visitées, temps passé, interactions) et leur attribue un score de priorité. Elle identifie automatiquement les leads les plus chauds et les assigne aux commerciaux les plus adaptés selon leur historique de performance. L'IA apprend de tes patterns de conversion pour améliorer continuellement ses prédictions et optimiser ton taux de fermeture.",
  },
  {
    question: "Est-ce que KLOZD remplace vraiment HubSpot / Salesforce / Pipedrive ?",
    answer: "Oui, KLOZD remplace effectivement ces outils pour les équipes commerciales qui cherchent la simplicité et l'efficacité. Contrairement à HubSpot ou Salesforce qui sont souvent surchargés de fonctionnalités, KLOZD se concentre sur l'essentiel : capturer des leads, les qualifier, planifier des rendez-vous, et closer des deals. Tu économises jusqu'à 5,000€/an en consolidant 6+ outils en un seul, tout en gagnant en productivité.",
  },
  {
    question: "Qu'est-ce qui vous différencie des autres CRM ?",
    answer: "KLOZD se distingue par sa simplicité, son prix accessible, et son approche tout-en-un. Alors que la plupart des CRM nécessitent plusieurs intégrations coûteuses, KLOZD intègre nativement formulaires, calendrier, visioconférence, et gamification. Notre IA de priorisation est spécialement conçue pour les équipes commerciales, et notre système de gamification motive naturellement ton équipe. Enfin, notre tarif fondateur à vie pour les early adopters est une opportunité unique.",
  },
  {
    question: "Comment fonctionne la prédiction de conversion ?",
    answer: "Notre algorithme analyse plusieurs signaux : le score de qualification du lead, son historique d'interactions, son engagement avec tes contenus, et les patterns de conversion de ton équipe. L'IA identifie les deals prêts à être closés et te suggère les actions prioritaires. Plus tu utilises KLOZD, plus les prédictions deviennent précises grâce à l'apprentissage automatique basé sur tes données réelles.",
  },
  {
    question: "Quand est prévu le lancement de KLOZD ?",
    answer: "KLOZD sera lancé au Q2 2026. Les 100 premiers inscrits bénéficient d'un accès prioritaire dès le lancement, d'un tarif fondateur à vie (réduction permanente de 20%), et d'un canal privé pour co-construire KLOZD avec nous. C'est une opportunité unique de faire partie des pionniers et de façonner l'outil selon tes besoins.",
  },
  {
    question: "Y a-t-il des alternatives ?",
    answer: "Bien sûr, il existe d'autres CRM sur le marché. Mais KLOZD est le seul qui combine simplicité, prix accessible, et fonctionnalités tout-en-un sans nécessiter d'intégrations multiples. Si tu cherches un outil simple, efficace, et conçu spécifiquement pour les équipes commerciales qui veulent closer plus de deals sans la complexité des gros CRM, KLOZD est fait pour toi.",
  },
];

export function FAQNew() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="section-padding bg-background relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container-narrow relative z-10">
        <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10 sm:mb-16 animate-fade-in-up px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Questions <span className="text-gradient">fréquentes</span>
          </h2>
        </div>
        
        <div className="space-y-2 sm:space-y-2.5 px-2">
          {faqs.map((faq, index) => {
            const delayClasses = ["delay-100", "delay-200", "delay-300", "delay-400", "delay-500", "delay-600", "delay-700"];
            return (
            <Card 
              key={index} 
              className={`overflow-hidden transition-all duration-500 group ${
                openIndex === index
                  ? "border-2 border-primary/50 shadow-2xl shadow-primary/10 bg-gradient-to-br from-card to-card/95"
                  : "border border-border/50 hover:border-primary/30 shadow-md hover:shadow-xl bg-card/50 backdrop-blur-sm"
              }`}
            >
              {/* Premium glow effect when open */}
              {openIndex === index && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"></div>
              )}
              
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex flex-1 items-center justify-between transition-all text-left w-full relative z-10 group/button"
                aria-expanded={openIndex === index}
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 py-4 sm:py-5 px-4 sm:px-5">
                  {/* Premium icon indicator */}
                  <div className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-500 ${
                    openIndex === index
                      ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30"
                      : "bg-accent/50 text-muted-foreground group-hover/button:bg-primary/20 group-hover/button:text-primary"
                  }`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`w-4 h-4 sm:w-[18px] sm:h-[18px] transition-transform duration-500 ${
                        openIndex === index ? "rotate-180" : ""
                      }`}
                    >
                      <path d="m6 9 6 6 6-6"></path>
                    </svg>
                  </div>
                  
                  <h3 className={`text-sm sm:text-base font-bold transition-all duration-300 flex-1 leading-snug ${
                    openIndex === index
                      ? "text-foreground"
                      : "text-foreground/90 group-hover/button:text-primary"
                  }`}>
                    {faq.question}
                  </h3>
                </div>
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openIndex === index
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
                role="region"
                aria-hidden={openIndex !== index}
              >
                {faq.answer && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pl-12 sm:pl-16 relative">
                    {/* Decorative line */}
                    <div className="absolute left-4 sm:left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 to-transparent"></div>
                    <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            </Card>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
}
