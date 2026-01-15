import { Card } from "@/components/ui/card";

const features = [
  {
    title: "Formulaires intelligents",
    description:
      "Créez des formulaires de qualification avec logique conditionnelle, scoring automatique et tracking d'abandons.",
    icon: "📝",
  },
  {
    title: "Gestion de leads",
    description:
      "Pipeline complet de gestion des leads avec attribution automatique, scoring IA et qualification intelligente.",
    icon: "🎯",
  },
  {
    title: "Planification de rendez-vous",
    description:
      "Système de réservation avec disponibilités en temps réel, rappels automatiques et gestion des no-shows.",
    icon: "📅",
  },
  {
    title: "CRM intégré",
    description:
      "Suivez vos deals, visualisez votre pipeline et analysez vos performances avec des tableaux de bord dédiés.",
    icon: "📊",
  },
  {
    title: "Visioconférence native",
    description:
      "Appels vidéo intégrés avec enregistrement, transcription IA et suivi des performances de closing.",
    icon: "🎥",
  },
  {
    title: "Multi-tenant sécurisé",
    description:
      "Isolation complète des données par organisation avec audit logs, rétention configurable et sécurité renforcée.",
    icon: "🔒",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Tout ce dont vous avez besoin pour closer
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Une plateforme complète pour gérer vos leads et fermer plus de deals
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              hover 
              className="group"
            >
              <div className="text-5xl mb-6 transition-transform duration-300 group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 leading-tight">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
