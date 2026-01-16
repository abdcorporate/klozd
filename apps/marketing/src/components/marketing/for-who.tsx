import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const profiles = [
  {
    title: "Solo",
    description: "Tu gères seul (freelance, coach, consultant). Tu veux un outil simple qui t'aide à ne jamais oublier un prospect et à maximiser chaque opportunité.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
  },
  {
    title: "Équipe de 2-5 commerciaux",
    description: "Tu veux piloter ta petite équipe avec clarté, suivre les performances de chacun et créer une saine émulation sans complexité.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
  },
  {
    title: "Agence & entreprises",
    description: "Tu gères plusieurs équipes, plusieurs projets. Tu as besoin d'analytics poussées, d'intégrations sur mesure et d'un account manager dédié.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
        <path d="M10 6h4"></path>
        <path d="M10 10h4"></path>
        <path d="M10 14h4"></path>
        <path d="M10 18h4"></path>
      </svg>
    ),
  },
];

export function ForWho() {
  return (
    <section id="for-who" className="section-padding bg-background">
      <div className="container-narrow">
        <div className="text-center mb-10 sm:mb-16 animate-fade-in-up px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Pour <span className="text-gradient">qui</span> ?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            KLOZD s'adapte à tous les profils d'équipes commerciales
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-2">
          {profiles.map((profile, index) => {
            const delayClasses = ["delay-200", "delay-400", "delay-600"];
            return (
              <Card key={index} className={`card-hover flex flex-col p-8 group animate-fade-in-up ${delayClasses[index] || ""}`}>
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                {profile.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">
                {profile.title}
              </h3>
              <p className="text-muted-foreground mb-6 flex-grow leading-relaxed">
                {profile.description}
              </p>
              <Button variant="outline" className="w-full h-10 rounded-xl border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300" href="/waitlist">
                Devenir early adopter
              </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
