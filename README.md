# KLOZD - Plateforme CRM tout-en-un

Plateforme SaaS CRM complète pour infopreneurs et équipes de closing, construite avec Next.js, NestJS, TypeScript et Prisma.

## 🚀 Démarrage rapide

### ⚡ Configuration rapide

**Avant de lancer, tu dois configurer quelques choses manuellement.**

1. **Vérifier les prérequis** :
```bash
./check-setup.sh
```

2. **Suivre le guide complet** : Voir [SETUP.md](./SETUP.md) pour les instructions détaillées.

### 📋 Checklist rapide

- [ ] Node.js 20+ installé
- [ ] pnpm 10+ installé  
- [ ] PostgreSQL 14+ installé et démarré
- [ ] Base de données `klozd` créée
- [ ] Fichier `apps/api/.env` créé avec `DATABASE_URL` et `JWT_SECRET`
- [ ] Fichier `apps/web/.env.local` créé avec `NEXT_PUBLIC_API_URL`
- [ ] Client Prisma généré : `cd apps/api && pnpm prisma:generate`
- [ ] Migrations appliquées : `cd apps/api && pnpm prisma:migrate dev --name init`

### 🎯 Une fois configuré

```bash
# Démarrer API + Web en parallèle
pnpm dev

# Ou séparément :
pnpm dev:api  # API sur http://localhost:3001
pnpm dev:web  # Web sur http://localhost:3000
```

## 📁 Structure du projet

```
klozd/
├── apps/
│   ├── api/              # API NestJS
│   │   ├── src/
│   │   │   ├── auth/      # Authentification
│   │   │   ├── forms/      # Formulaires
│   │   │   ├── leads/      # Leads
│   │   │   ├── crm/        # CRM & Pipeline
│   │   │   ├── scheduling/ # Planning & RDV
│   │   │   ├── ai/         # IA & Prédictions
│   │   │   ├── notifications/ # Notifications
│   │   │   └── dashboard/  # Dashboards
│   │   └── prisma/
│   │       └── schema.prisma
│   └── web/               # Frontend Next.js
│       └── src/
│           ├── app/        # Pages Next.js
│           ├── components/ # Composants React
│           ├── lib/        # Utilitaires & API
│           └── store/      # State management (Zustand)
└── packages/               # Packages partagés (futur)
```

## 🎯 Fonctionnalités

### ✅ Implémenté

- **Authentification** : Inscription, connexion, JWT
- **Formulaires** : CRUD, scoring, qualification automatique
- **Leads** : Gestion, scoring, attribution intelligente
- **CRM** : Pipeline, deals, statistiques
- **Scheduling** : Rendez-vous, attribution closeurs
- **IA** : Prédiction de closing, scoring
- **Notifications** : Email, SMS, WhatsApp (structure prête)
- **Dashboards** : Vue CEO et Closeuse

### ⏳ À venir

- Capture automatique des abandons
- Système de follow-up automatique
- Intégrations (Zoom, SendGrid, Twilio)
- Calendrier interactif
- Éditeur de formulaires visuel

## 🔧 Commandes utiles

### Backend (API)
```bash
cd apps/api

# Générer le client Prisma
pnpm prisma:generate

# Créer une migration
pnpm prisma:migrate dev

# Ouvrir Prisma Studio
pnpm prisma:studio

# Démarrer en dev
pnpm start:dev
```

### Frontend (Web)
```bash
cd apps/web

# Démarrer en dev
pnpm dev

# Build production
pnpm build

# Démarrer production
pnpm start
```

## 📚 Documentation

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour la documentation technique complète.

## 🛠️ Technologies

- **Backend** : NestJS, TypeScript, Prisma, PostgreSQL
- **Frontend** : Next.js 16, React 19, TypeScript, Tailwind CSS
- **State** : Zustand
- **Forms** : React Hook Form, Zod
- **HTTP** : Axios

## 📝 License

ISC

