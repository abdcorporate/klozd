import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const securityFeatures = [
  {
    title: "Multi-tenant isolé",
    description:
      "Isolation complète des données par organisation avec filtrage automatique au niveau de la base de données.",
    badge: "Isolation",
  },
  {
    title: "Audit logs complets",
    description:
      "Traçabilité totale de toutes les actions critiques avec historique complet et recherche avancée.",
    badge: "Traçabilité",
  },
  {
    title: "Idempotency",
    description:
      "Protection contre les doublons avec clés d'idempotence pour garantir l'intégrité des données.",
    badge: "Intégrité",
  },
  {
    title: "Anti-abuse",
    description:
      "Protection contre les abus avec rate limiting, honeypot, validation de timestamp et détection de bots.",
    badge: "Sécurité",
  },
  {
    title: "Tokens sécurisés",
    description:
      "Authentification avec refresh tokens en cookies HttpOnly, rotation automatique et protection CSRF.",
    badge: "Auth",
  },
];

export function Security() {
  return (
    <section id="security" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Sécurité de niveau entreprise
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Vos données sont protégées avec les meilleures pratiques de
            sécurité
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {securityFeatures.map((feature, index) => (
            <Card key={index} hover className="group">
              <Badge variant="orange" className="mb-5 transition-transform duration-300 group-hover:scale-105">
                {feature.badge}
              </Badge>
              <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3 leading-tight">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg text-slate-600">
            🔒 Conformité RGPD • Chiffrement des données • Sauvegardes
            automatiques
          </p>
        </div>
      </div>
    </section>
  );
}
