# KLOZD Marketing Site

Site marketing premium pour KLOZD - Landing page avec design moderne type "Lovable style".

## 🚀 Technologies

- **Next.js 16.1+** avec App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Fonts**: Geist Sans + Geist Mono (next/font/google)

## 📦 Installation

```bash
# Depuis la racine du monorepo
pnpm install

# Ou depuis apps/marketing
cd apps/marketing
pnpm install
```

## 🏃 Développement

```bash
# Depuis la racine du monorepo
pnpm --filter marketing run dev

# Ou depuis apps/marketing
cd apps/marketing
pnpm dev
```

L'application sera accessible sur [http://localhost:3002](http://localhost:3002)

## 🏗️ Build

```bash
cd apps/marketing
pnpm build
pnpm start
```

## 📁 Structure

```
apps/marketing/
├── src/
│   ├── app/                    # Pages Next.js App Router
│   │   ├── layout.tsx          # Layout principal avec fonts
│   │   ├── page.tsx            # Landing page (/)
│   │   ├── waitlist/           # Page waitlist
│   │   ├── privacy/            # Page privacy
│   │   └── terms/               # Page terms
│   ├── components/
│   │   ├── ui/                  # Composants UI réutilisables
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── badge.tsx
│   │   └── marketing/           # Composants marketing
│   │       ├── header.tsx
│   │       ├── hero.tsx
│   │       ├── features.tsx
│   │       ├── how-it-works.tsx
│   │       ├── security.tsx
│   │       ├── testimonials.tsx
│   │       ├── faq.tsx
│   │       ├── final-cta.tsx
│   │       ├── footer.tsx
│   │       ├── trust-bar.tsx
│   │       └── waitlist-form.tsx
│   └── lib/
│       └── utils.ts             # Utilitaires (cn, etc.)
├── tailwind.config.ts          # Configuration Tailwind v4
├── postcss.config.mjs          # Configuration PostCSS
├── next.config.ts              # Configuration Next.js
└── package.json
```

## 🎨 Design System

### Palette de couleurs

- **Orange KLOZD**: `#f9952a` (brand-orange)
- **Fond**: `slate-50` (#f9fafb)
- **Texte**: `slate-900` (noir)
- **Borders**: `gray-200`

### Composants UI

- **Button**: Variants `primary`, `secondary`, `outline`
- **Card**: Cards blanches avec border et shadow
- **Badge**: Badges avec variants

### Animations

- `pulse-slow`: Pulse lent (8s)
- `float`: Animation de flottement (6s)
- `gradient-shift`: Décalage de gradient (8s)

## 📄 Pages

1. **/** - Landing page complète avec toutes les sections
2. **/waitlist** - Formulaire d'inscription à la liste d'attente
3. **/privacy** - Politique de confidentialité (placeholder)
4. **/terms** - Conditions d'utilisation (placeholder)

## 🔧 Configuration

### Variables d'environnement

Aucune variable d'environnement requise pour le moment. Le formulaire waitlist nécessitera une intégration avec l'API backend.

### Port

L'application tourne sur le port **3002** par défaut pour éviter les conflits avec l'app web (3000) et l'API (3001).

## 🎯 Fonctionnalités

- ✅ Header sticky avec navigation
- ✅ Hero section avec CTAs
- ✅ Trust bar (logos)
- ✅ Features (6 cards)
- ✅ How it works (3 steps)
- ✅ Security section
- ✅ Testimonials (3)
- ✅ FAQ avec accordéon
- ✅ Final CTA section
- ✅ Footer
- ✅ Formulaire waitlist avec validation
- ✅ SEO (metadata, OpenGraph)
- ✅ Accessibilité (ARIA labels, focus rings)

## 📝 TODO

- [ ] Intégrer le formulaire waitlist avec l'API backend
- [ ] Ajouter de vraies screenshots dans la section Hero
- [ ] Ajouter de vrais logos dans la Trust Bar
- [ ] Compléter les pages Privacy et Terms
- [ ] Ajouter analytics (Plausible, etc.)
- [ ] Optimiser les images
- [ ] Ajouter des tests E2E

## 🚀 Déploiement

L'application peut être déployée sur Vercel, Netlify ou tout autre plateforme supportant Next.js.

```bash
# Build de production
pnpm build

# Vérifier le build
pnpm start
```

## 📚 Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [React 19](https://react.dev/)
