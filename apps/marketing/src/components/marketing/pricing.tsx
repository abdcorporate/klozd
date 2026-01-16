import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "BASIC",
    price: "67",
    period: "/mois",
    badge: "Essayer",
    features: [
      "1 utilisateur",
      "500 leads / mois",
      "Formulaires illimités",
      "Pipeline Kanban + ventes",
      "Dashboard visuel détaillé",
      "Onboarding et support",
      "Support email",
    ],
    note: "",
    buttonVariant: "outline" as const,
  },
  {
    name: "PRO",
    price: "147",
    period: "/mois",
    badge: "Pro",
    popular: true,
    features: [
      "5 utilisateurs",
      "Leads illimités",
      "Tout BASIC +",
      "IA de priorisation intelligente",
      "Web Scraper",
      "Intégrations avancées",
      "Dashboard clé intelligent (leaderboard)",
      "Analytics avancées",
      "Support prioritaire 24h/7",
    ],
    buttonVariant: "primary" as const,
  },
  {
    name: "BUSINESS",
    price: "297",
    period: "/mois",
    badge: "Business",
    features: [
      "Utilisateurs illimités",
      "Leads illimités",
      "Tout PRO +",
      "Intégration sur-mesure AI",
      "White-label (en option)",
      "Dashboard personnalisé",
      "API privée personnalisée",
      "Account manager",
      "Démo/onboarding dédié",
      "Support dédié",
    ],
    note: "",
    buttonVariant: "outline" as const,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="section-padding section-dark">
      <div className="container-narrow">
        <div className="text-center mb-10 sm:mb-16 animate-fade-in-up px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="text-gradient">Tarification</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">Des prix qui tuent</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start px-2">
          {plans.map((plan, index) => {
            const delayClasses = ["delay-200", "delay-400", "delay-600"];
            return (
            <Card
              key={index}
              className={`relative p-5 sm:p-6 lg:p-8 transition-all duration-300 ${
                plan.popular
                  ? "border-2 border-primary shadow-xl md:scale-105 md:hover:scale-[1.07]"
                  : "border-border hover:border-primary/50 hover:shadow-lg"
              }`}
            >
              <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full mb-4">
                {plan.badge}
              </span>
              <h3 className="text-xl font-bold mb-6">{plan.name}</h3>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-primary mt-0.5 flex-shrink-0"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {plan.note && (
                <p className="text-xs text-muted-foreground mb-6">{plan.note}</p>
              )}
              <Button
                variant="primary"
                className={`w-full h-11 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group ${
                  plan.popular
                    ? "bg-gradient-to-r from-[#FFD700] to-[#FFC107] hover:from-[#FFC107] hover:to-[#FFA000] text-black shadow-xl hover:shadow-2xl hover:shadow-[#FFD700]/50 hover:scale-105"
                    : "bg-gradient-to-r from-[#FFD700] to-[#FFC107] hover:from-[#FFC107] hover:to-[#FFA000] text-black shadow-lg hover:shadow-xl hover:shadow-[#FFD700]/30 hover:scale-[1.02]"
                }`}
                href="/waitlist"
              >
                <span className="relative z-10 text-black">Réserver ma place</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Button>
            </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
