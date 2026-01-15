import { Header } from "@/components/marketing/header";

export const metadata = {
  title: "Conditions d'utilisation - KLOZD",
  description: "Conditions d'utilisation de KLOZD",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl border border-border shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Conditions d'utilisation
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <div className="prose prose-slate max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptation des conditions</h2>
                <p className="text-muted-foreground leading-relaxed">
                  En accédant et en utilisant KLOZD, vous acceptez d'être lié par les présentes conditions d'utilisation. 
                  Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Description du service</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  KLOZD est une plateforme SaaS de gestion de la relation client (CRM) qui permet aux utilisateurs de :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Gérer leurs leads et contacts commerciaux</li>
                  <li>Suivre leur pipeline de ventes</li>
                  <li>Créer et gérer des formulaires de capture de leads</li>
                  <li>Planifier et gérer des rendez-vous</li>
                  <li>Utiliser des fonctionnalités d'intelligence artificielle pour la priorisation</li>
                  <li>Accéder à des tableaux de bord et analyses</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. Inscription et compte utilisateur</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Pour utiliser KLOZD, vous devez créer un compte en fournissant des informations exactes et à jour. 
                  Vous êtes responsable de :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Maintenir la confidentialité de vos identifiants de connexion</li>
                  <li>Toutes les activités qui se produisent sous votre compte</li>
                  <li>Nous informer immédiatement de toute utilisation non autorisée</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Tarification et facturation</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  KLOZD propose différents plans tarifaires. Les prix sont indiqués en euros TTC et peuvent être modifiés à tout moment. 
                  Les utilisateurs bénéficiant d'un tarif fondateur à vie conservent leur réduction permanente de 20% même en cas de changement de tarification générale.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Les paiements sont effectués mensuellement ou annuellement selon le plan choisi. 
                  En cas de non-paiement, l'accès au service peut être suspendu.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Utilisation acceptable</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Vous vous engagez à utiliser KLOZD uniquement à des fins légales et conformément à ces conditions. 
                  Il est interdit de :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Utiliser le service pour des activités illégales ou frauduleuses</li>
                  <li>Tenter d'accéder à des parties non autorisées du service</li>
                  <li>Transmettre des virus, codes malveillants ou tout autre élément nuisible</li>
                  <li>Copier, modifier ou créer des œuvres dérivées du service</li>
                  <li>Utiliser des robots, scripts automatisés ou des méthodes similaires</li>
                  <li>Violer les droits de propriété intellectuelle d'autrui</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Propriété intellectuelle</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Tous les droits de propriété intellectuelle relatifs à KLOZD, y compris mais sans s'y limiter, 
                  les logiciels, designs, textes, graphiques et logos, sont la propriété exclusive de KLOZD ou de ses concédants de licence. 
                  Vous ne disposez d'aucun droit de propriété sur ces éléments.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Données et confidentialité</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Vous conservez tous les droits sur vos données. KLOZD s'engage à protéger vos données conformément à notre 
                  Politique de confidentialité et au Règlement Général sur la Protection des Données (RGPD). 
                  Nous n'utilisons vos données que pour fournir et améliorer le service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Disponibilité du service</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nous nous efforçons d'assurer une disponibilité continue du service, mais nous ne garantissons pas 
                  une disponibilité à 100%. Le service peut être interrompu pour maintenance, mises à jour ou en cas de 
                  force majeure. Nous ne serons pas responsables des dommages résultant d'indisponibilités temporaires.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Limitation de responsabilité</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Dans les limites autorisées par la loi, KLOZD ne pourra être tenu responsable de :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Dommages indirects, consécutifs ou accessoires</li>
                  <li>Perte de données, de profits ou d'opportunités commerciales</li>
                  <li>Interruptions de service</li>
                  <li>Actions de tiers ou utilisateurs</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Notre responsabilité totale ne pourra excéder le montant payé par vous au cours des 12 derniers mois.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Résiliation</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Vous pouvez résilier votre compte à tout moment depuis les paramètres de votre compte. 
                  Nous nous réservons le droit de suspendre ou résilier votre compte en cas de :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Violation de ces conditions d'utilisation</li>
                  <li>Non-paiement des frais dus</li>
                  <li>Inactivité prolongée</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  En cas de résiliation, vos données seront conservées pendant 30 jours, puis supprimées définitivement 
                  sauf obligation légale de conservation.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">11. Modifications des conditions</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications seront 
                  publiées sur cette page avec une date de mise à jour. Votre utilisation continue du service après 
                  les modifications constitue votre acceptation des nouvelles conditions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">12. Droit applicable et juridiction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Ces conditions sont régies par le droit français. En cas de litige, et après tentative de résolution 
                  amiable, les tribunaux français seront seuls compétents.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">13. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Pour toute question concernant ces conditions d'utilisation, vous pouvez nous contacter via 
                  notre formulaire de contact ou à l'adresse email indiquée sur notre site.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
