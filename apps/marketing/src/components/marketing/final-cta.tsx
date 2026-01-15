import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-brand-orange-50/30 to-white relative overflow-hidden">
      {/* Subtle glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-orange/5 rounded-full blur-3xl animate-pulse-slow -z-10" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
          Prêt à transformer votre business ?
        </h2>
        <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          Rejoignez la liste d'attente et soyez parmi les premiers à découvrir
          KLOZD
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
    </section>
  );
}
