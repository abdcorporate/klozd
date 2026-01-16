import { Card } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Capte & Store",
    subtitle: "Centralise tous tes leads dans un seul endroit électrisé",
    description: "Que ce soit via formulaires web, réseaux sociaux, emails ou recommandations, tous tes prospects arrivent automatiquement dans ton CRM. Plus de leads perdus, plus de fichiers Excel éparpillés.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
      </svg>
    ),
  },
  {
    number: "02",
    title: "IA & Meetings",
    subtitle: "Pilote avec l'IA ton attribution intelligente",
    description: "L'IA analyse le comportement de tes leads et les assigne automatiquement aux bons commerciaux. Synchronise tes rendez-vous, reçois des rappels intelligents et ne rate plus jamais un follow-up.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"></path>
        <path d="M16 2v4"></path>
        <path d="M8 2v4"></path>
        <path d="M3 10h5"></path>
        <path d="M17.5 17.5 16 16.3V14"></path>
        <circle cx="16" cy="16" r="6"></circle>
      </svg>
    ),
  },
  {
    number: "03",
    title: "Close & Gratifie",
    subtitle: "Convertis tout ce qui bloque et surveille avec simplicité",
    description: "Les insights en temps réel t'aident à identifier les deals prêts à closer. Le système de gamification motive ton équipe, et le dashboard te donne une vue claire sur ta performance.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
        <path d="M4 22h16"></path>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
      </svg>
    ),
  },
];

export function HowItWorksNew() {
  return (
    <section id="how-it-works" className="section-padding bg-background">
      <div className="container-narrow">
        <div className="text-center mb-10 sm:mb-16 animate-fade-in-up px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Comment <span className="text-gradient">KLOZD</span> fonctionne
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Un workflow simple à 3 étapes qui fait tout le reste pour toi. Reste focus.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 px-2">
          {steps.map((step, index) => {
            const delayClasses = ["delay-200", "delay-400", "delay-600"];
            return (
              <div key={index} className={`relative animate-fade-in-up ${delayClasses[index] || ""}`}>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[calc(100%_-_1rem)] w-[calc(100%_-_2rem)] h-0.5" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.3), transparent)' }} />
              )}
              <Card className="card-hover h-full p-6 lg:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl font-bold text-primary/20">{step.number}</span>
                  <div className="feature-icon text-primary">{step.icon}</div>
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-primary font-medium text-sm mb-4">{step.subtitle}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                <div className="mt-6 h-24 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-accent/30 border border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 group/icon">
                  <div className="text-primary group-hover/icon:scale-110 transition-transform duration-300">{step.icon}</div>
                </div>
              </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
