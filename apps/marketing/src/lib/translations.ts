export type Language = "fr" | "en";

export const translations = {
  nav: {
    features: { fr: "Fonctionnalités", en: "Features" },
    pricing: { fr: "Tarifs", en: "Pricing" },
    faq: { fr: "FAQ", en: "FAQ" },
    waitlist: { fr: "Rejoindre la Waitlist", en: "Join Waitlist" },
  },
  hero: {
    badge: { fr: "Lancement Q2 2026", en: "Launching Q2 2026" },
    headline1: { fr: "La plateforme #1", en: "The #1 platform" },
    headline2: { fr: "du closing.", en: "for closing." },
    rotatingPrefix: { fr: "Le CRM tout-en-un pour", en: "The all-in-one CRM for" },
    rotatingWords: {
      fr: ["Infopreneurs", "Coachs", "Agences", "Closeurs"],
      en: ["Infopreneurs", "Coaches", "Agencies", "Sales Reps"],
    },
    subheadline: {
      fr: "Formulaires intelligents, prise de RDV IA, visio intégrée, CRM simplifié. Remplace ta stack complète et close plus de deals.",
      en: "Smart forms, AI scheduling, integrated video calls, simplified CRM. Replace your entire stack and close more deals.",
    },
    ctaPrimary: { fr: "Rejoindre la Waitlist", en: "Join the Waitlist" },
    ctaSecondary: { fr: "Calculer mes économies", en: "Calculate my savings" },
    stats: {
      setup: { fr: "Setup en 15 min", en: "15min setup" },
      saved: { fr: "+30% taux de show", en: "+30% show rate" },
      price: { fr: "Dès 97€/mois", en: "From 97€/month" },
    },
    trustedBy: { fr: "Ils nous font déjà confiance", en: "Already trusted by" },
  },
  calculator: {
    badge: { fr: "Calculateur ROI", en: "ROI Calculator" },
    headline: { fr: "Calcule tes économies", en: "Calculate your savings" },
    headlineSub: { fr: "avec KLOZD", en: "with KLOZD" },
    description: {
      fr: "Compare ta stack actuelle vs KLOZD. Vois combien tu économises chaque mois.",
      en: "Compare your current stack vs KLOZD. See how much you save each month.",
    },
    currentStack: { fr: "Ta stack actuelle (€/mois)", en: "Your current stack (€/month)" },
    leadsLabel: { fr: "Leads traités par mois", en: "Leads processed per month" },
    timeSaved: { fr: "économisées par mois", en: "saved per month" },
    moneySaved: { fr: "d'économies/an", en: "savings/year" },
    conversionBoost: { fr: "de conversions", en: "conversions" },
    cta: { fr: "Commencer à économiser", en: "Start saving" },
    note: {
      fr: "*vs stack classique HubSpot + Calendly + Zoom",
      en: "*vs classic HubSpot + Calendly + Zoom stack",
    },
  },
  features: {
    forms: {
      tag: { fr: "Formulaires", en: "Forms" },
      headline: { fr: "Capture chaque lead.\nMême les abandons.", en: "Capture every lead.\nEven abandonments." },
      description: {
        fr: "Formulaires intelligents avec logique conditionnelle, scoring automatique, et capture des leads qui abandonnent. Plus jamais de prospect perdu.",
        en: "Smart forms with conditional logic, automatic scoring, and capture of leads who abandon. Never lose a prospect again.",
      },
      benefits: {
        fr: [
          "Logique conditionnelle : qualifié → calendrier, disqualifié → nurturing",
          "Capture automatique des abandons (récupère 15-20% des leads)",
          "Scoring IA pour prioriser les meilleurs prospects",
        ],
        en: [
          "Conditional logic: qualified → calendar, disqualified → nurturing",
          "Automatic abandonment capture (recover 15-20% of leads)",
          "AI scoring to prioritize the best prospects",
        ],
      },
    },
    scheduling: {
      tag: { fr: "Scheduling IA", en: "AI Scheduling" },
      headline: { fr: "Attribution intelligente.\nChaque lead au bon closeur.", en: "Smart attribution.\nEach lead to the right closer." },
      description: {
        fr: "L'IA analyse le profil du prospect et l'assigne au closeur ayant le meilleur taux de closing pour ce type de deal. Fini le round robin aveugle.",
        en: "AI analyzes the prospect profile and assigns them to the closer with the best closing rate for this type of deal. No more blind round robin.",
      },
      benefits: {
        fr: [
          "Attribution IA basée sur le match profil/closeur",
          "Confirmations automatiques Email, SMS, WhatsApp",
          "+30% de taux de show avec rappels intelligents",
        ],
        en: [
          "AI attribution based on profile/closer match",
          "Automatic Email, SMS, WhatsApp confirmations",
          "+30% show rate with smart reminders",
        ],
      },
    },
    video: {
      tag: { fr: "Visio Intégrée", en: "Integrated Video" },
      headline: { fr: "Tout en un clic.\nPendant l'appel.", en: "Everything in one click.\nDuring the call." },
      description: {
        fr: "Visio intégrée avec panel latéral : infos prospect, score IA, réponses formulaire, notes en temps réel. Tu as tout sous les yeux pour closer.",
        en: "Integrated video with side panel: prospect info, AI score, form responses, real-time notes. Everything you need to close.",
      },
      benefits: {
        fr: [
          "Panel latéral avec toutes les infos prospect",
          "Score de probabilité de closing en temps réel",
          "Logging du résultat en < 30 secondes après l'appel",
        ],
        en: [
          "Side panel with all prospect info",
          "Real-time closing probability score",
          "Result logging in < 30 seconds after the call",
        ],
      },
    },
    crm: {
      tag: { fr: "CRM Inbox Zero", en: "Inbox Zero CRM" },
      headline: { fr: "3 vues. Zéro complexité.\nTu sais quoi faire.", en: "3 views. Zero complexity.\nYou know what to do." },
      description: {
        fr: "Oublie les 15 colonnes Kanban. KLOZD INBOX te dit exactement quoi faire aujourd'hui. Vue Équipe montre qui fait quoi. Pipeline donne la vue d'ensemble.",
        en: "Forget 15 Kanban columns. KLOZD INBOX tells you exactly what to do today. Team View shows who does what. Pipeline gives the overview.",
      },
      benefits: {
        fr: [
          "Ma Inbox : actions du jour, triées par urgence",
          "Vue Équipe : qui fait quoi en temps réel",
          "Actions en 1 clic (vs 6 clics sur HubSpot)",
        ],
        en: [
          "My Inbox: today's actions, sorted by urgency",
          "Team View: who does what in real-time",
          "1-click actions (vs 6 clicks on HubSpot)",
        ],
      },
    },
    ai: {
      tag: { fr: "IA Prédictive", en: "Predictive AI" },
      headline: { fr: "L'IA te dit qui closer.\nEt comment.", en: "AI tells you who to close.\nAnd how." },
      description: {
        fr: "Score de probabilité de closing, suggestions de messages pré-écrits, résumé automatique d'appel. L'IA travaille pour toi, pas l'inverse.",
        en: "Closing probability score, pre-written message suggestions, automatic call summary. AI works for you, not the other way around.",
      },
      benefits: {
        fr: [
          "Prédiction de closing (75% précision)",
          "Messages suggérés par l'IA selon le contexte",
          "Résumé auto d'appel avec objections et next steps",
        ],
        en: [
          "Closing prediction (75% accuracy)",
          "AI-suggested messages based on context",
          "Auto call summary with objections and next steps",
        ],
      },
    },
    dashboard: {
      tag: { fr: "Dashboard", en: "Dashboard" },
      headline: { fr: "Chaque KPI.\nEn temps réel.", en: "Every KPI.\nIn real-time." },
      description: {
        fr: "Dashboard CEO : vue funnel complète, performance par closeur, CA en cours. Dashboard Closeur : tes stats, tes appels du jour, ton classement.",
        en: "CEO Dashboard: complete funnel view, performance by closer, current revenue. Closer Dashboard: your stats, today's calls, your ranking.",
      },
      benefits: {
        fr: [
          "Taux de conversion à chaque étape du funnel",
          "Performance par closeur avec gamification",
          "Alertes proactives : deals bloqués, no-shows élevés",
        ],
        en: [
          "Conversion rate at each funnel stage",
          "Performance by closer with gamification",
          "Proactive alerts: stuck deals, high no-shows",
        ],
      },
    },
    gamification: {
      tag: { fr: "Gamification", en: "Gamification" },
      headline: { fr: "Motive tes équipes.\nComme un jeu.", en: "Motivate your teams.\nLike a game." },
      description: {
        fr: "Classements, badges, objectifs personnalisés. Transforme ton équipe en machine de closing avec une compétition saine et motivante.",
        en: "Leaderboards, badges, personalized goals. Turn your team into a closing machine with healthy and motivating competition.",
      },
      benefits: {
        fr: [
          "Leaderboard temps réel par closeur",
          "Badges et récompenses automatiques",
          "Défis hebdo et objectifs personnalisés",
        ],
        en: [
          "Real-time leaderboard by closer",
          "Automatic badges and rewards",
          "Weekly challenges and personalized goals",
        ],
      },
    },
    salesPages: {
      tag: { fr: "Pages IA", en: "AI Pages" },
      headline: { fr: "Génère tes pages.\nEn 2 minutes.", en: "Generate your pages.\nIn 2 minutes." },
      description: {
        fr: "L'IA génère des pages de vente optimisées pour la conversion. Fini systeme.io et ClickFunnels. Tout intégré nativement.",
        en: "AI generates conversion-optimized sales pages. No more systeme.io and ClickFunnels. Everything natively integrated.",
      },
      benefits: {
        fr: [
          "Génération IA de pages de vente",
          "Templates optimisés pour la conversion",
          "Intégration native avec ton CRM",
        ],
        en: [
          "AI-generated sales pages",
          "Conversion-optimized templates",
          "Native integration with your CRM",
        ],
      },
    },
  },
  comparison: {
    badge: { fr: "Comparaison", en: "Comparison" },
    headline: { fr: "KLOZD vs Stack", en: "KLOZD vs Stack" },
    headlineSub: { fr: "traditionnelle", en: "traditional" },
    description: { fr: "Pourquoi les infopreneurs passent de 5 outils à KLOZD", en: "Why infopreneurs switch from 5 tools to KLOZD" },
    featureLabel: { fr: "Fonctionnalité", en: "Feature" },
    traditionalLabel: { fr: "Stack classique", en: "Classic stack" },
    items: {
      fr: [
        "Formulaires + scoring automatique",
        "Scheduling avec attribution IA",
        "Visio intégrée avec panel prospect",
        "CRM Inbox Zero (3 vues simples)",
        "IA de prédiction de closing",
        "Capture des abandons formulaire",
        "Confirmations multi-canal auto",
        "Prix tout compris < 300€/mois",
      ],
      en: [
        "Forms + automatic scoring",
        "Scheduling with AI attribution",
        "Integrated video with prospect panel",
        "Inbox Zero CRM (3 simple views)",
        "Closing prediction AI",
        "Form abandonment capture",
        "Multi-channel auto confirmations",
        "All-inclusive price < 300€/month",
      ],
    },
    stats: {
      time: { value: "5h", label: { fr: "Gagnées/semaine", en: "Saved/week" } },
      show: { value: "+30%", label: { fr: "Taux de show", en: "Show rate" } },
      closing: { value: "+15%", label: { fr: "Taux closing", en: "Closing rate" } },
      savings: { value: "60-80%", label: { fr: "Économies", en: "Savings" } },
    },
  },
  tools: {
    headline: { fr: "Arrête de payer 5 outils.\nPasse à KLOZD.", en: "Stop paying for 5 tools.\nSwitch to KLOZD." },
    totalOld: { fr: "/mois minimum", en: "/month minimum" },
    oldTotal: { fr: "220€/mois = 2,640€/an", en: "220€/month = 2,640€/year" },
    klozdPrice: { fr: "/mois tout compris", en: "/month all-inclusive" },
    savings: { fr: "Économise 1,600€+/an", en: "Save 1,600€+/year" },
    items: [
      { name: "Jotform", price: "30€", category: { fr: "Formulaires", en: "Forms" } },
      { name: "Calendly", price: "15€", category: { fr: "Scheduling", en: "Scheduling" } },
      { name: "Zoom", price: "15€", category: { fr: "Visio", en: "Video" } },
      { name: "HubSpot", price: "90€", category: { fr: "CRM", en: "CRM" } },
      { name: "Twilio", price: "30€", category: { fr: "SMS/WhatsApp", en: "SMS/WhatsApp" } },
      { name: "Zapier", price: "40€", category: { fr: "Automations", en: "Automations" } },
    ],
  },
  testimonials: {
    badge: { fr: "Témoignages", en: "Testimonials" },
    headline: { fr: "Ils ont choisi KLOZD.", en: "They chose KLOZD." },
    headlineSub: { fr: "Et ils en parlent.", en: "And they talk about it." },
    description: { fr: "Rejoins les infopreneurs qui ont simplifié leur gestion commerciale.", en: "Join infopreneurs who simplified their sales management." },
    waitlistCount: { fr: "entrepreneurs sur la waitlist", en: "entrepreneurs on the waitlist" },
    trustedBy: { fr: "Ils nous font confiance", en: "They trust us" },
    items: {
      fr: [
        {
          name: "Zineb A.",
          role: "CEO, Coaching Business",
          quote: "Je passais 5h/semaine à jongler entre mes outils. Avec KLOZD, tout est centralisé. Mon équipe de 3 closeuses est enfin synchronisée.",
        },
        {
          name: "Thomas L.",
          role: "Infopreneur, Formation en ligne",
          quote: "Le taux de show est passé de 65% à 85%. Les rappels automatiques font vraiment la différence. Et l'IA d'attribution est bluffante.",
        },
        {
          name: "Sarah M.",
          role: "Closeuse, Agence Marketing",
          quote: "L'interface est simple, pas comme HubSpot. Je log mes appels en 30 secondes et je ne rate plus jamais un follow-up.",
        },
      ],
      en: [
        {
          name: "Zineb A.",
          role: "CEO, Coaching Business",
          quote: "I spent 5h/week juggling between my tools. With KLOZD, everything is centralized. My team of 3 closers is finally synchronized.",
        },
        {
          name: "Thomas L.",
          role: "Infopreneur, Online Training",
          quote: "Show rate went from 65% to 85%. Automatic reminders really make a difference. And the attribution AI is mind-blowing.",
        },
        {
          name: "Sarah M.",
          role: "Closer, Marketing Agency",
          quote: "The interface is simple, not like HubSpot. I log my calls in 30 seconds and never miss a follow-up anymore.",
        },
      ],
    },
  },
  pricing: {
    badge: { fr: "Tarifs", en: "Pricing" },
    headline: { fr: "Des tarifs", en: "Pricing that" },
    headlineSub: { fr: "qui ont du sens", en: "makes sense" },
    description: { fr: "Tout inclus. Pas de frais cachés. Passe à l'échelle quand tu veux.", en: "All-inclusive. No hidden fees. Scale when you want." },
    monthly: { fr: "Mensuel", en: "Monthly" },
    yearly: { fr: "Annuel", en: "Yearly" },
    yearlyDiscount: { fr: "-20%", en: "-20%" },
    billedYearly: { fr: "Facturé annuellement", en: "Billed annually" },
    cta: { fr: "Rejoindre la Waitlist", en: "Join the Waitlist" },
    earlyBird: { fr: "Early bird : -50% à vie pour les 500 premiers", en: "Early bird: -50% lifetime for the first 500" },
    plans: {
      fr: [
        {
          name: "Starter",
          price: { monthly: 97, yearly: 78 },
          description: "Pour les solopreneurs qui démarrent",
          features: [
            "1 utilisateur (closeur)",
            "500 leads/mois",
            "Formulaires intelligents",
            "Scheduling + Visio intégrée",
            "CRM Inbox Zero",
            "Confirmations Email",
            "Support email",
          ],
        },
        {
          name: "Pro",
          price: { monthly: 197, yearly: 158 },
          description: "Pour les équipes sales en croissance",
          features: [
            "5 utilisateurs",
            "Leads illimités",
            "Tout Starter +",
            "Attribution IA des closeurs",
            "Prédiction de closing IA",
            "Confirmations SMS incluses",
            "Dashboard équipe",
            "Support prioritaire",
          ],
          isPopular: true,
        },
        {
          name: "Business",
          price: { monthly: 297, yearly: 238 },
          description: "Pour les équipes ambitieuses",
          features: [
            "Utilisateurs illimités",
            "Tout Pro +",
            "WhatsApp confirmations",
            "API + Intégrations custom",
            "Rapports avancés",
            "Onboarding dédié",
            "Manager dédié",
          ],
        },
      ],
      en: [
        {
          name: "Starter",
          price: { monthly: 97, yearly: 78 },
          description: "For solopreneurs getting started",
          features: [
            "1 user (closer)",
            "500 leads/month",
            "Smart forms",
            "Scheduling + Integrated video",
            "Inbox Zero CRM",
            "Email confirmations",
            "Email support",
          ],
        },
        {
          name: "Pro",
          price: { monthly: 197, yearly: 158 },
          description: "For growing sales teams",
          features: [
            "5 users",
            "Unlimited leads",
            "Everything in Starter +",
            "AI closer attribution",
            "AI closing prediction",
            "SMS confirmations included",
            "Team dashboard",
            "Priority support",
          ],
          isPopular: true,
        },
        {
          name: "Business",
          price: { monthly: 297, yearly: 238 },
          description: "For ambitious teams",
          features: [
            "Unlimited users",
            "Everything in Pro +",
            "WhatsApp confirmations",
            "API + Custom integrations",
            "Advanced reports",
            "Dedicated onboarding",
            "Dedicated manager",
          ],
        },
      ],
    },
  },
  faq: {
    headline: { fr: "Questions fréquentes", en: "Frequently asked questions" },
    items: {
      fr: [
        {
          question: "Quand KLOZD sera-t-il disponible ?",
          answer: "KLOZD lance en Q2 2026. Rejoins la waitlist maintenant pour bénéficier de -50% à vie et d'un accès prioritaire.",
        },
        {
          question: "C'est compliqué à mettre en place ?",
          answer: "Pas du tout ! KLOZD est conçu pour la simplicité. La plupart des utilisateurs sont opérationnels en 15 minutes. Notre wizard d'onboarding te guide à chaque étape.",
        },
        {
          question: "KLOZD remplace vraiment tous mes outils ?",
          answer: "Oui. Formulaires (Jotform), Scheduling (Calendly), Visio (Zoom), CRM (HubSpot), Notifications (Twilio). Tout est intégré nativement.",
        },
        {
          question: "Comment fonctionne l'IA d'attribution ?",
          answer: "L'IA analyse le profil du prospect (secteur, budget, urgence) et le compare aux forces de chaque closeur pour attribuer au meilleur match. Résultat : +15% de taux de closing.",
        },
        {
          question: "Est-ce que je peux essayer avant d'acheter ?",
          answer: "Absolument ! Tous les plans incluent 14 jours d'essai gratuit. Pas de carte de crédit requise pour commencer.",
        },
        {
          question: "Quelle est votre politique de remboursement ?",
          answer: "Garantie satisfait ou remboursé pendant 30 jours. Si KLOZD ne te convient pas, on te rembourse intégralement, sans questions.",
        },
      ],
      en: [
        {
          question: "When will KLOZD be available?",
          answer: "KLOZD launches in Q2 2026. Join the waitlist now to get -50% lifetime and priority access.",
        },
        {
          question: "Is it complicated to set up?",
          answer: "Not at all! KLOZD is designed for simplicity. Most users are operational in 15 minutes. Our onboarding wizard guides you through every step.",
        },
        {
          question: "Does KLOZD really replace all my tools?",
          answer: "Yes. Forms (Jotform), Scheduling (Calendly), Video (Zoom), CRM (HubSpot), Notifications (Twilio). Everything is natively integrated.",
        },
        {
          question: "How does the attribution AI work?",
          answer: "AI analyzes the prospect profile (industry, budget, urgency) and compares it to each closer's strengths to assign the best match. Result: +15% closing rate.",
        },
        {
          question: "Can I try before I buy?",
          answer: "Absolutely! All plans include a 14-day free trial. No credit card required to start.",
        },
        {
          question: "What's your refund policy?",
          answer: "30-day money-back guarantee. If KLOZD doesn't work for you, we'll refund you completely, no questions asked.",
        },
      ],
    },
  },
  finalCta: {
    badge: { fr: "Places limitées", en: "Limited spots" },
    headline: { fr: "Rejoins les", en: "Join the first" },
    headlineSub: { fr: "500 premiers", en: "500" },
    description: { fr: "-50% à vie, accès prioritaire, et influence sur les prochaines fonctionnalités.", en: "-50% lifetime, priority access, and influence on upcoming features." },
    spotsTaken: { fr: "places prises", en: "spots taken" },
    cta: { fr: "Réserver ma place", en: "Secure my spot" },
    noCreditCard: { fr: "Aucune carte de crédit requise", en: "No credit card required" },
    joinCount: { fr: "Rejoins", en: "Join" },
    entrepreneurs: { fr: "entrepreneurs", en: "entrepreneurs" },
  },
  footer: {
    tagline: { fr: "La plateforme sales tout-en-un pour infopreneurs et équipes commerciales.", en: "The all-in-one sales platform for infopreneurs and sales teams." },
    product: { fr: "Produit", en: "Product" },
    company: { fr: "Entreprise", en: "Company" },
    legal: { fr: "Légal", en: "Legal" },
    features: { fr: "Fonctionnalités", en: "Features" },
    roadmap: { fr: "Roadmap", en: "Roadmap" },
    about: { fr: "À propos", en: "About" },
    blog: { fr: "Blog", en: "Blog" },
    contact: { fr: "Contact", en: "Contact" },
    privacy: { fr: "Confidentialité", en: "Privacy" },
    terms: { fr: "CGU", en: "Terms" },
    copyright: { fr: "© 2026 KLOZD. Conçu pour les entrepreneurs qui veulent scaler.", en: "© 2026 KLOZD. Built for entrepreneurs who want to scale." },
  },
} as const;

export function t(key: string, lang: Language = "fr"): string {
  const keys = key.split(".");
  let value: any = translations;
  for (const k of keys) {
    value = value?.[k];
  }
  return value?.[lang] ?? value ?? key;
}
