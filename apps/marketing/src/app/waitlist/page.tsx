import { Suspense } from "react";
import { Header } from "@/components/marketing/header";
import { WaitlistForm } from "@/components/marketing/waitlist-form";

export const metadata = {
  title: "Rejoindre la liste d'attente - KLOZD",
  description: "Rejoignez la liste d'attente pour être parmi les premiers à accéder à KLOZD.",
};

function WaitlistFormWrapper() {
  return (
    <Suspense fallback={
      <div className="text-center py-12 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded-lg mx-auto mb-4"></div>
        <div className="h-4 w-64 bg-muted rounded-lg mx-auto"></div>
      </div>
    }>
      <WaitlistForm />
    </Suspense>
  );
}

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 md:pt-32 pb-20 relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-narrow relative z-10">
          <div className="max-w-3xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12 md:mb-16 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6 animate-scale-in delay-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
                </svg>
                <span>🔥 Plus que quelques places</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up delay-300">
                Fais partie des <span className="text-gradient">100 pionniers</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto animate-fade-in-up delay-400">
                Les 100 premiers inscrits bénéficient d'un <strong className="text-foreground">accès prioritaire</strong>, d'un tarif fondateur à vie et d'un canal privé pour co-construire KLOZD avec nous.
              </p>
              <p className="text-sm text-muted-foreground animate-fade-in delay-500">
                Une fois les places parties, c'est fini.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-3 gap-4 mb-12 md:mb-16">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center animate-fade-in-up delay-600">
                <div className="text-2xl mb-2">🎁</div>
                <div className="text-sm font-semibold mb-1">Tarif fondateur</div>
                <div className="text-xs text-muted-foreground">À vie</div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center animate-fade-in-up delay-700">
                <div className="text-2xl mb-2">🚀</div>
                <div className="text-sm font-semibold mb-1">Accès prioritaire</div>
                <div className="text-xs text-muted-foreground">Dès le lancement</div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center animate-fade-in-up delay-800">
                <div className="text-2xl mb-2">💬</div>
                <div className="text-sm font-semibold mb-1">Canal privé</div>
                <div className="text-xs text-muted-foreground">Co-construction</div>
              </div>
            </div>

            {/* Form */}
            <div className="animate-fade-in-up delay-900">
              <WaitlistFormWrapper />
            </div>

            {/* Trust indicators */}
            <div className="mt-12 text-center animate-fade-in delay-1000">
              <p className="text-sm text-muted-foreground mb-4">
                🔒 Vos données sont sécurisées • Pas de spam • Désinscription à tout moment
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
