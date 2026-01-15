import { Button } from "@/components/ui/button";

export function FinalCTANew() {
  return (
    <section className="section-padding section-dark relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.05), hsl(var(--primary) / 0.1))' }} />
      
      <div className="container-narrow relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6 animate-fade-in-up delay-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
            </svg>
            <span>🔥 Plus que quelques places</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-fade-in-up delay-300">
            Fais partie des <span className="text-gradient">100 pionniers.</span>
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up delay-400">
            Les 100 premiers inscrits bénéficient d'un <strong className="text-foreground">accès prioritaire</strong>, d'un tarif fondateur à vie et d'un canal privé pour co-construire KLOZD avec nous. Une fois les places parties, c'est fini.
          </p>
          
          <div className="animate-scale-in delay-500">
            <Button variant="primary" size="lg" className="h-12 text-lg px-12 py-8 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FFC107] hover:from-[#FFC107] hover:to-[#FFA000] text-black font-bold shadow-xl hover:shadow-2xl hover:shadow-[#FFD700]/50 transition-all duration-300 hover:scale-105 relative overflow-hidden group" href="/waitlist">
              <span className="relative z-10 text-black">Réserver ma place</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Button>
          </div>
          
          <p className="mt-6 text-sm text-muted-foreground animate-fade-in delay-600">
            Pas de CB • 0 engagement • Offre limitée aux 100 premiers
          </p>
        </div>
      </div>
    </section>
  );
}
