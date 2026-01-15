import { Button } from "@/components/ui/button";

export function HeroNew() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, hsl(var(--primary) / 0.05), transparent)' }} />
      
      <div className="container-narrow relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="badge-launch mb-6 inline-flex animate-fade-in-up delay-200">
            <span>🚀</span>
            <span>Lancement Q2 2026</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up delay-300">
            Le CRM <span className="text-gradient">tout-en-un.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto animate-fade-in-up delay-400">
            Un seul outil pour tracker tous tes leads, closer tous tes deals et piloter ta croissance. Automatise ce qui doit l'être et concentre-toi sur ce qui compte : <strong className="text-foreground">Remplis juste ta tirelire.</strong>
          </p>
          <p className="text-sm text-muted-foreground mb-8 animate-fade-in-up delay-500">
            Pour entrepreneurs, leads, RDV, projets — vos revenus sont centralisés.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4 animate-fade-in-up delay-600">
            <Button variant="primary" size="lg" className="h-11 text-lg px-8 py-6 rounded-xl bg-[#FFD700] hover:bg-[#FFC107] text-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" href="/waitlist">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 w-5 h-5">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                <path d="M20 3v4"></path>
                <path d="M22 5h-4"></path>
                <path d="M4 17v2"></path>
                <path d="M5 18H3"></path>
              </svg>
              Faire partie des 100 premiers
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 w-5 h-5">
                <path d="M7 7h10v10"></path>
                <path d="M7 17 17 7"></path>
              </svg>
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground animate-fade-in delay-700">
            🎁 Offre exclusive réservée aux early adopters
          </div>
          
          <div className="mt-16 lg:mt-24 animate-fade-in-up delay-800">
            <div className="border-t border-border pt-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                <div className="text-center group animate-scale-in delay-900">
                  <div className="flex justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div className="stat-number mb-1 group-hover:text-primary transition-colors">20k+</div>
                  <div className="text-sm text-muted-foreground">prospects</div>
                </div>
                <div className="text-center group animate-scale-in delay-1000">
                  <div className="flex justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                      <polyline points="16 7 22 7 22 13"></polyline>
                    </svg>
                  </div>
                  <div className="stat-number mb-1 group-hover:text-primary transition-colors">98%</div>
                  <div className="text-sm text-muted-foreground">de ROI</div>
                </div>
                <div className="text-center group animate-scale-in delay-1100">
                  <div className="flex justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary">
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="6"></circle>
                      <circle cx="12" cy="12" r="2"></circle>
                    </svg>
                  </div>
                  <div className="stat-number mb-1 group-hover:text-primary transition-colors">15%</div>
                  <div className="text-sm text-muted-foreground">de fermeture</div>
                </div>
                <div className="text-center group animate-scale-in delay-1200">
                  <div className="flex justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary">
                      <path d="M8 2v4"></path>
                      <path d="M16 2v4"></path>
                      <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                      <path d="M3 10h18"></path>
                    </svg>
                  </div>
                  <div className="stat-number mb-1 group-hover:text-primary transition-colors">4h</div>
                  <div className="text-sm text-muted-foreground">économisées</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
