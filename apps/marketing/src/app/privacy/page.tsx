import { Header } from "@/components/marketing/header";

export const metadata = {
  title: "Politique de confidentialité - KLOZD",
  description: "Politique de confidentialité de KLOZD",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl border border-border shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Politique de confidentialité
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <div className="prose prose-slate max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  KLOZD s'engage à protéger votre vie privée et vos données personnelles. Cette politique de confidentialité 
                  explique comment nous collectons, utilisons, stockons et protégeons vos informations personnelles conformément 
                  au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Responsable du traitement</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Le responsable du traitement des données personnelles est KLOZD. Pour toute question concernant le traitement 
                  de vos données, vous pouvez nous contacter via notre formulaire de contact ou à l'adresse email indiquée sur notre site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. Données collectées</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Nous collectons les données suivantes :
                </p>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">3.1. Données d'identification</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone (optionnel)</li>
                  <li>Informations de facturation</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-3">3.2. Données d'utilisation</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li>Données de connexion (adresse IP, type de navigateur, système d'exploitation)</li>
                  <li>Historique d'utilisation de la plateforme</li>
                  <li>Préférences et paramètres</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-3">3.3. Données de contenu</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Leads et contacts que vous ajoutez</li>
                  <li>Formulaires créés et réponses collectées</li>
                  <li>Notes, tâches et interactions</li>
                  <li>Données de pipeline et transactions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Finalités du traitement</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Nous utilisons vos données pour :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Fournir et améliorer nos services</li>
                  <li>Gérer votre compte et votre abonnement</li>
                  <li>Traiter les paiements et la facturation</li>
                  <li>Vous contacter concernant votre compte ou nos services</li>
                  <li>Personnaliser votre expérience utilisateur</li>
                  <li>Analyser l'utilisation de la plateforme pour améliorer nos fonctionnalités</li>
                  <li>Respecter nos obligations légales et réglementaires</li>
                  <li>Détecter et prévenir la fraude ou les abus</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Base légale du traitement</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Le traitement de vos données personnelles est basé sur :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>L'exécution d'un contrat</strong> : pour fournir les services souscrits</li>
                  <li><strong>Votre consentement</strong> : pour les communications marketing et les cookies non essentiels</li>
                  <li><strong>Notre intérêt légitime</strong> : pour améliorer nos services et prévenir la fraude</li>
                  <li><strong>Les obligations légales</strong> : pour respecter la réglementation applicable</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Conservation des données</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Nous conservons vos données personnelles :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Pendant la durée de votre abonnement</strong> et 30 jours après sa résiliation</li>
                  <li><strong>Données de facturation</strong> : 10 ans conformément aux obligations comptables</li>
                  <li><strong>Données de connexion</strong> : 12 mois maximum</li>
                  <li><strong>Données de consentement marketing</strong> : jusqu'à retrait du consentement</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Après ces délais, vos données sont supprimées ou anonymisées de manière sécurisée.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Partage des données</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos données avec :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Prestataires de services</strong> : hébergement, paiement, email (sous contrat strict de confidentialité)</li>
                  <li><strong>Autorités compétentes</strong> : si requis par la loi ou une décision judiciaire</li>
                  <li><strong>En cas de fusion ou acquisition</strong> : avec notification préalable</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Tous nos prestataires sont situés dans l'Union Européenne ou bénéficient de garanties appropriées 
                  (clauses contractuelles types, Privacy Shield, etc.).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Sécurité des données</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Chiffrement des données en transit (HTTPS/TLS) et au repos</li>
                  <li>Authentification forte et gestion sécurisée des mots de passe</li>
                  <li>Surveillance et détection d'intrusions</li>
                  <li>Sauvegardes régulières et sécurisées</li>
                  <li>Accès restreint aux données (principe du moindre privilège)</li>
                  <li>Formation du personnel à la protection des données</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Vos droits</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Droit d'accès</strong> : obtenir une copie de vos données personnelles</li>
                  <li><strong>Droit de rectification</strong> : corriger vos données inexactes ou incomplètes</li>
                  <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données (sous réserve d'obligations légales)</li>
                  <li><strong>Droit à la limitation</strong> : limiter le traitement de vos données</li>
                  <li><strong>Droit à la portabilité</strong> : récupérer vos données dans un format structuré</li>
                  <li><strong>Droit d'opposition</strong> : vous opposer au traitement pour motifs légitimes</li>
                  <li><strong>Droit de retirer votre consentement</strong> : à tout moment pour les traitements basés sur le consentement</li>
                  <li><strong>Droit de définir des directives</strong> : concernant le sort de vos données après votre décès</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Pour exercer ces droits, contactez-nous via notre formulaire de contact ou à l'adresse email indiquée. 
                  Nous répondrons dans un délai d'un mois maximum.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Cookies et technologies similaires</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Nous utilisons des cookies et technologies similaires pour :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Cookies essentiels</strong> : nécessaires au fonctionnement de la plateforme (authentification, sécurité)</li>
                  <li><strong>Cookies analytiques</strong> : pour comprendre l'utilisation de la plateforme (avec votre consentement)</li>
                  <li><strong>Cookies de préférences</strong> : pour mémoriser vos paramètres</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Vous pouvez gérer vos préférences de cookies depuis les paramètres de votre navigateur ou notre bandeau de consentement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">11. Transferts internationaux</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Vos données sont principalement stockées et traitées dans l'Union Européenne. En cas de transfert vers 
                  un pays tiers, nous nous assurons que des garanties appropriées sont en place (clauses contractuelles types, 
                  Privacy Shield, etc.) conformément au RGPD.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">12. Données des mineurs</h2>
                <p className="text-muted-foreground leading-relaxed">
                  KLOZD n'est pas destiné aux personnes de moins de 18 ans. Nous ne collectons pas sciemment de données 
                  personnelles de mineurs. Si nous apprenons qu'un mineur nous a fourni des données, nous les supprimerons immédiatement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">13. Modifications de cette politique</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications seront publiées 
                  sur cette page avec une date de mise à jour. Nous vous informerons des modifications importantes par email 
                  ou via une notification dans la plateforme.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">14. Réclamation</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Si vous estimez que le traitement de vos données personnelles constitue une violation du RGPD, vous avez 
                  le droit d'introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) :
                </p>
                <p className="text-muted-foreground leading-relaxed mt-2">
                  CNIL<br />
                  3 Place de Fontenoy - TSA 80715<br />
                  75334 PARIS CEDEX 07<br />
                  Téléphone : 01 53 73 22 22<br />
                  Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">15. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles, 
                  vous pouvez nous contacter via notre formulaire de contact ou à l'adresse email indiquée sur notre site.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
