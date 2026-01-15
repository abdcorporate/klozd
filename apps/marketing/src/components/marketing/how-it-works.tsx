import { Card } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Créez vos formulaires",
    description:
      "Concevez des formulaires de qualification avec logique conditionnelle et règles de scoring personnalisées.",
  },
  {
    number: "02",
    title: "Qualifiez vos leads",
    description:
      "Les leads sont automatiquement qualifiés, scorés et attribués à vos closeuses selon vos règles.",
  },
  {
    number: "03",
    title: "Fermez vos deals",
    description:
      "Planifiez des rendez-vous, effectuez vos appels et suivez vos deals jusqu'à la signature.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Comment ça marche
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Un processus simple en 3 étapes pour transformer vos prospects en
            clients
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <Card hover className="h-full">
                <div className="text-7xl font-bold text-brand-orange/10 mb-6 transition-transform duration-300 group-hover:scale-110">
                  {step.number}
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-4 leading-tight">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </Card>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-brand-orange/30 to-transparent transform -translate-y-1/2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
