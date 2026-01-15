import { Card } from "@/components/ui/card";

export function ReplaceTools() {
  return (
    <section className="section-padding section-dark relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container-narrow relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Remplace <span className="text-gradient">6+ outils</span> par une seule plateforme.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Arrête de jongler entre 12 apps. Centralise tout.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 mb-20">
          {["Formulaires & Tracking", "Calendrier", "Vente", "CRM Pipeline", "Gamification", "Notifications"].map((tag, index) => {
            const delayClasses = ["delay-100", "delay-200", "delay-300", "delay-400", "delay-500", "delay-600"];
            return (
              <span key={tag} className={`px-4 py-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full text-sm font-medium shadow-sm hover:border-primary/50 hover:shadow-md hover:bg-card transition-all duration-300 cursor-default animate-scale-in ${delayClasses[index] || ""}`}>
                {tag}
              </span>
            );
          })}
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          {/* Avant */}
          <div className="w-full md:w-80 bg-card/40 backdrop-blur-sm rounded-3xl p-8 border border-border/50 shadow-xl text-center relative overflow-hidden group hover:border-border transition-all duration-500 animate-slide-in-left delay-300">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 20px)' }}></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full text-xs font-semibold text-muted-foreground mb-4">
                <span className="w-2 h-2 bg-muted-foreground rounded-full"></span>
                Avant
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
                250~500€<span className="text-lg font-normal text-muted-foreground">/mois</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">En moyenne 6 à 7 logiciels utilisés</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["CRM", "Email", "Calendar", "Forms", "Analytics", "Tasks"].map((tool) => (
                  <span key={tool} className="px-3 py-1.5 bg-muted/30 border border-border/30 rounded-lg text-xs font-medium text-muted-foreground backdrop-blur-sm">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Flèche premium */}
          <div className="hidden md:flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD700] via-[#FFC107] to-[#FFA000] text-black hover:scale-110 hover:rotate-12 transition-all duration-500 shadow-2xl shadow-[#FFD700]/40 relative group animate-scale-in delay-400">
            <div className="absolute inset-0 rounded-full bg-[#FFD700]/30 blur-xl group-hover:bg-[#FFD700]/40 transition-all duration-500"></div>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 relative z-10 text-black">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </div>
          
          {/* Après - Premium */}
          <div className="w-full md:w-80 bg-gradient-to-br from-card via-card to-card/80 rounded-3xl p-8 border-2 border-primary/50 shadow-2xl text-center relative overflow-hidden group hover:border-primary hover:shadow-[0_0_40px_rgba(255,215,0,0.3)] transition-all duration-500 animate-slide-in-right delay-500">
            {/* Premium glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -top-1 -right-1 bg-gradient-to-br from-[#FFD700] to-[#FFC107] text-black text-xs font-bold px-4 py-1.5 rounded-bl-2xl rounded-tr-3xl shadow-lg">
              À partir de 67€/mois
            </div>
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full text-xs font-semibold text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                Après avec KLOZD
              </div>
              <div className="flex justify-center mb-4">
                <span className="font-bold tracking-tight text-4xl md:text-5xl">
                  <span className="text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">K</span>
                  <span className="text-foreground">LOZD</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Économise jusqu'à <strong className="text-[#FFD700] font-bold text-base">+5,000€/an</strong> et des heures
              </p>
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                <span className="text-sm font-semibold text-primary">Tout inclus</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
