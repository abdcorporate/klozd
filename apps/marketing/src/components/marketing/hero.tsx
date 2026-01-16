import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative pt-24 pb-32 md:pt-32 md:pb-40 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient - plus subtil */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white -z-10" />
      
      {/* Glow effect - plus subtil et positionné */}
      <div className="absolute top-1/4 right-1/4 w-[800px] h-[800px] bg-brand-orange/5 rounded-full blur-3xl animate-pulse-slow -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-brand-orange/3 rounded-full blur-3xl animate-pulse-slow -z-10" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center rounded-full bg-brand-orange-50/80 backdrop-blur-sm border border-brand-orange-100 px-4 py-1.5 text-sm font-medium text-brand-orange-700 mb-2 hover:bg-brand-orange-100/80 transition-colors duration-300">
              🚀 CRM tout-en-un
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight text-balance">
              Le CRM tout-en-un{" "}
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed text-balance max-w-2xl mx-auto lg:mx-0">
              Gestion de leads, formulaires intelligents, rendez-vous, CRM et
              visioconférence native. Tout ce dont vous avez besoin pour fermer
              plus de deals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button variant="primary" size="lg" href="/waitlist">
                Rejoindre la liste d'attente
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="https://my.klozd.com/login" target="_blank" rel="noopener noreferrer">
                  Se connecter
                </a>
              </Button>
            </div>
          </div>

          {/* Screenshot placeholder */}
          <div className="relative">
            <div className="relative bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 md:p-8 animate-float hover:shadow-3xl transition-shadow duration-500">
              <div className="aspect-video bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-brand-orange/20 to-brand-orange/10 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <span className="text-3xl">📊</span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Screenshot placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
