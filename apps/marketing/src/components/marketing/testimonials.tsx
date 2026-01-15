import { Card } from "@/components/ui/card";

const testimonials = [
  {
    name: "Marie Dupont",
    role: "CEO, Infopreneur Academy",
    content:
      "KLOZD a transformé notre façon de gérer les leads. Le scoring automatique et l'attribution intelligente nous font gagner des heures chaque semaine.",
    avatar: "👩‍💼",
  },
  {
    name: "Jean Martin",
    role: "Fondateur, Sales Pro",
    content:
      "La visioconférence native est un game-changer. Plus besoin de Zoom ou Calendly, tout est intégré et ça change tout pour notre équipe.",
    avatar: "👨‍💼",
  },
  {
    name: "Sophie Bernard",
    role: "Directrice Commerciale, Growth Co",
    content:
      "Le CRM intégré et les tableaux de bord nous donnent une vision claire de notre pipeline. On peut enfin prendre des décisions basées sur les données.",
    avatar: "👩‍💻",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Découvrez comment KLOZD aide les équipes à performer
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} hover className="h-full group">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-orange/10 to-brand-orange/5 flex items-center justify-center text-3xl mr-4 transition-transform duration-300 group-hover:scale-110">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-lg">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-slate-500">
                    {testimonial.role}
                  </div>
                </div>
              </div>
              <p className="text-slate-600 italic leading-relaxed">"{testimonial.content}"</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
