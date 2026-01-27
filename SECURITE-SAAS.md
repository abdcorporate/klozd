# 🔒 Sécurité du SaaS KLOZD

## 📋 Vue d'ensemble

Ce document décrit toutes les mesures de sécurité implémentées dans KLOZD et les bonnes pratiques à suivre.

---

## ✅ Mesures de sécurité déjà en place

### 1. 🔐 Authentification & Autorisation

#### **JWT avec Refresh Tokens**
- ✅ **Access Token** : JWT signé avec `JWT_SECRET`, expiration courte (15 minutes)
- ✅ **Refresh Token** : Stocké en cookie `HttpOnly`, hashé en base (bcrypt), rotation à chaque refresh
- ✅ **Validation** : Vérification de l'utilisateur à chaque requête via `JwtStrategy`
- ✅ **Expiration** : Tokens expirés rejetés automatiquement

#### **RBAC (Role-Based Access Control)**
- ✅ **Rôles** : `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `CLOSER`, `SETTER`
- ✅ **Permissions granulaires** : Système de permissions par ressource
- ✅ **Guards** : `JwtAuthGuard` (global), `RolesGuard`, `OwnershipGuard`
- ✅ **Décorateurs** : `@Public()`, `@RequireRoles()`, `@RequirePermissions()`

#### **Ownership & Isolation**
- ✅ **TenantPrismaService** : Filtrage automatique par `organizationId` sur toutes les requêtes
- ✅ **OwnershipGuard** : Vérification que l'utilisateur peut accéder à la ressource
- ✅ **Isolation multi-tenant** : Garantie qu'un utilisateur ne peut pas accéder aux données d'une autre organisation

#### **Email Verification**
- ✅ **Vérification obligatoire** : Les utilisateurs doivent vérifier leur email avant de se connecter
- ✅ **Codes à 6 chiffres** : Expiration après 15 minutes
- ✅ **Renvoi automatique** : Nouveau code généré lors d'une tentative de connexion avec email non vérifié

---

### 2. 🛡️ Protection contre les attaques

#### **Brute-Force Protection**
- ✅ **Service dédié** : `BruteForceService` avec table `AuthAttempt`
- ✅ **Limites** : 5 tentatives max, verrouillage 15 minutes (configurable)
- ✅ **Par email + IP** : Tracking combiné pour éviter les contournements
- ✅ **Email enumeration** : Messages d'erreur génériques ("Email ou mot de passe incorrect")
- ✅ **Reset automatique** : Réinitialisation des échecs après connexion réussie

#### **Rate Limiting**
- ✅ **Global** : 100 requêtes/minute (Throttler)
- ✅ **Par route** :
  - `POST /auth/login` : 10/min
  - `POST /auth/register` : 5/min
  - `POST /auth/resend-verification` : 3/min
  - `GET /forms/public/:slug` : 30/min
  - `POST /leads/forms/:formId/submit` : 10/min
  - `POST /scheduling/appointments/public` : 10/min
- ✅ **Bypass OPTIONS** : Les requêtes preflight CORS ne sont pas limitées

#### **CSRF Protection**
- ✅ **Double-submit pattern** : Token dans cookie + header `X-CSRF-Token`
- ✅ **Validation** : `CsrfGuard` avec `timingSafeEqual` (protection timing attacks)
- ✅ **Endpoints protégés** : `/auth/refresh`, `/auth/logout`
- ✅ **Génération** : Endpoint `GET /auth/csrf` pour obtenir le token

#### **Helmet.js**
- ✅ **Headers de sécurité** : Configuration Helmet activée
- ✅ **CSP désactivé** : Pour permettre les requêtes API (peut être réactivé si besoin)
- ✅ **CORS** : Configuration stricte avec whitelist d'origins

#### **Validation des données**
- ✅ **class-validator** : Validation automatique sur tous les DTOs
- ✅ **ValidationPipe global** : `whitelist: true`, `forbidNonWhitelisted: true`
- ✅ **Sanitization** : Exclusion automatique des champs non déclarés

#### **Honeypot & Timestamp**
- ✅ **Honeypot field** : Champ caché dans les formulaires publics (détection bots)
- ✅ **Timestamp validation** : Vérification que le formulaire n'est pas soumis trop rapidement (< 2s) ou trop tard (> 1h)
- ✅ **Body size limits** : Limite 1MB pour les endpoints publics

#### **Idempotency**
- ✅ **IdempotencyKey** : Protection contre les doublons de requêtes
- ✅ **Hash SHA256** : Détection des conflits (même key, body différent)
- ✅ **TTL 24h** : Nettoyage automatique des clés expirées

---

### 3. 🔒 Sécurité des données

#### **Mots de passe**
- ✅ **Hashing bcrypt** : Salt rounds = 10
- ✅ **Jamais en clair** : Les mots de passe ne sont jamais stockés ni loggés
- ✅ **Sanitization** : Exclusion des champs `password` dans les audit logs

#### **Isolation multi-tenant**
- ✅ **TenantPrismaService** : Toutes les requêtes filtrées par `organizationId`
- ✅ **Vérifications systématiques** : `findUnique`, `update`, `delete` vérifient l'appartenance
- ✅ **Tests E2E** : Vérification de l'isolation entre organisations

#### **Audit Logs**
- ✅ **Enregistrement complet** : Toutes les mutations critiques (CREATE, UPDATE, DELETE)
- ✅ **Métadonnées** : IP, User-Agent, timestamp, actor
- ✅ **Sanitization** : Exclusion des champs sensibles (password, tokens, secrets)
- ✅ **Rétention** : 365 jours (configurable)

#### **Data Retention**
- ✅ **Purge automatique** : Cron quotidien avec verrous distribués
- ✅ **Rétention configurable** :
  - FormAbandon : 90 jours
  - Notifications : 180 jours
  - AuditLog : 365 jours

---

### 4. 🌐 Sécurité réseau

#### **CORS**
- ✅ **Whitelist d'origins** : Configuration stricte via `CORS_ORIGINS`
- ✅ **Production** : Par défaut `https://my.klozd.app`, `https://klozd.app`
- ✅ **Development** : Tous les origins autorisés (dev uniquement)
- ✅ **Credentials** : `credentials: true` pour les cookies

#### **Trust Proxy**
- ✅ **Détection IP fiable** : Support `X-Forwarded-For`, `X-Real-IP`
- ✅ **Configuration** : `TRUST_PROXY=true` en production (derrière Ingress/LB)
- ✅ **IpDetectionService** : Service dédié pour la détection IP

#### **HTTPS**
- ⚠️ **À configurer en production** : Certificats SSL/TLS via Ingress/LoadBalancer
- ✅ **Cookies sécurisés** : `secure: true` en production (HTTPS uniquement)
- ✅ **SameSite** : `lax` pour la compatibilité

---

### 5. 📧 Sécurité email

#### **Validation stricte**
- ✅ **Format email** : Validation regex + `@IsEmail()` (class-validator)
- ✅ **Longueur max** : 255 caractères
- ✅ **Vérification Resend** : Retour d'erreur si l'envoi échoue

#### **Envoi direct**
- ✅ **Bypass queue** : Les emails de vérification utilisent `emailService` directement (pas de queue)
- ✅ **Resend ID** : Retour du `resendId` pour traçabilité
- ✅ **Logging** : Logs détaillés (to, from, subject, resendId, erreurs)

---

### 6. 🔍 Monitoring & Logging

#### **Logs structurés**
- ✅ **Pino** : Logging structuré avec niveaux (info, warn, error)
- ✅ **Métadonnées** : IP, User-Agent, userId, organizationId
- ✅ **Sanitization** : Exclusion des secrets dans les logs

#### **Audit Logs**
- ✅ **Traçabilité complète** : Toutes les actions critiques enregistrées
- ✅ **Recherche** : Filtrage par organization, user, action, entityType

---

## ⚠️ Améliorations recommandées

### 1. 🔐 Secrets Management

#### **Problème actuel**
- Les secrets sont stockés dans `.env` (fichier local)
- Pas de rotation automatique des secrets
- `JWT_SECRET` avec valeur par défaut faible en dev

#### **Recommandations**
- ✅ **Utiliser un gestionnaire de secrets** : AWS Secrets Manager, HashiCorp Vault, ou équivalent
- ✅ **Rotation automatique** : Rotation périodique de `JWT_SECRET`, clés API
- ✅ **Validation au démarrage** : Vérifier que tous les secrets requis sont présents
- ✅ **Pas de valeurs par défaut en production** : Faire échouer le démarrage si secrets manquants

```typescript
// Exemple : Validation au démarrage
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required in production');
}
```

---

### 2. 🔒 HTTPS & Certificats

#### **À faire**
- ✅ **Certificats SSL/TLS** : Configuration via Ingress/LoadBalancer
- ✅ **HSTS** : Header `Strict-Transport-Security` (via Helmet)
- ✅ **Redirection HTTP → HTTPS** : Forcer HTTPS en production

```typescript
// main.ts - Ajouter HSTS
app.use(
  helmet({
    hsts: {
      maxAge: 31536000, // 1 an
      includeSubDomains: true,
      preload: true,
    },
  }),
);
```

---

### 3. 🛡️ Content Security Policy (CSP)

#### **Actuellement désactivé**
- CSP est désactivé pour permettre les requêtes API

#### **Recommandation**
- ✅ **CSP strict pour le frontend** : Configurer CSP pour `apps/web` et `apps/marketing`
- ✅ **CSP permissive pour l'API** : Garder CSP désactivé pour l'API (ou configurer très permissif)

---

### 4. 🔍 Intrusion Detection

#### **À implémenter**
- ✅ **Détection d'anomalies** : Monitoring des patterns suspects (tentatives multiples, IPs suspectes)
- ✅ **Alertes** : Notifications en cas de détection d'attaque
- ✅ **Blacklist IP** : Blocage automatique des IPs malveillantes

---

### 5. 📊 Security Headers supplémentaires

#### **Recommandations**
- ✅ **X-Content-Type-Options** : `nosniff` (déjà via Helmet)
- ✅ **X-Frame-Options** : `DENY` (déjà via Helmet)
- ✅ **Referrer-Policy** : `strict-origin-when-cross-origin`
- ✅ **Permissions-Policy** : Limiter les permissions du navigateur

---

### 6. 🔐 2FA (Two-Factor Authentication)

#### **À implémenter**
- ✅ **TOTP** : Support Google Authenticator, Authy
- ✅ **SMS backup** : Code de secours par SMS
- ✅ **Recovery codes** : Codes de récupération à usage unique

---

### 7. 🔒 Encryption at Rest

#### **À vérifier**
- ✅ **Base de données** : Vérifier que PostgreSQL utilise le chiffrement au repos
- ✅ **Backups** : S'assurer que les backups sont chiffrés
- ✅ **Fichiers uploadés** : Chiffrer les fichiers stockés (S3 avec encryption, etc.)

---

### 8. 🧪 Security Testing

#### **À implémenter**
- ✅ **Tests de sécurité** : Tests automatisés pour les vulnérabilités courantes
- ✅ **Dependency scanning** : Scanner les dépendances (npm audit, Snyk, etc.)
- ✅ **Penetration testing** : Tests de pénétration périodiques
- ✅ **OWASP Top 10** : Vérifier la protection contre les vulnérabilités OWASP

---

### 9. 📋 Security Policies

#### **À documenter**
- ✅ **Password Policy** : Exigences de complexité (actuellement pas de validation côté serveur)
- ✅ **Session Management** : Durée de session, timeout automatique
- ✅ **Data Privacy** : Politique de confidentialité, RGPD compliance
- ✅ **Incident Response** : Procédure en cas de violation de sécurité

---

### 10. 🔐 API Security

#### **Améliorations possibles**
- ✅ **API Keys** : Support d'API keys pour les intégrations tierces (avec rate limiting spécifique)
- ✅ **OAuth2** : Support OAuth2 pour les intégrations
- ✅ **Webhooks signatures** : Vérification des signatures des webhooks entrants

---

## 📝 Checklist de sécurité pour la production

### Avant le déploiement

- [ ] **Secrets** : Tous les secrets configurés (pas de valeurs par défaut)
- [ ] **HTTPS** : Certificats SSL/TLS configurés
- [ ] **CORS** : Whitelist d'origins restreinte
- [ ] **Rate Limiting** : Limites ajustées selon le trafic attendu
- [ ] **Database** : Chiffrement au repos activé
- [ ] **Backups** : Backups chiffrés et testés
- [ ] **Monitoring** : Logs et alertes configurés
- [ ] **Dependencies** : `npm audit` passé, pas de vulnérabilités critiques
- [ ] **Environment** : `NODE_ENV=production` configuré
- [ ] **Trust Proxy** : `TRUST_PROXY=true` si derrière reverse proxy

### Après le déploiement

- [ ] **Health checks** : Endpoint `/health` fonctionnel
- [ ] **Rate limiting** : Vérifier que les limites sont respectées
- [ ] **CORS** : Tester les requêtes cross-origin
- [ ] **HTTPS** : Vérifier la redirection HTTP → HTTPS
- [ ] **Security headers** : Vérifier avec [SecurityHeaders.com](https://securityheaders.com)
- [ ] **SSL Labs** : Tester avec [SSL Labs](https://www.ssllabs.com/ssltest/)

---

## 🔗 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

---

## 📞 Contact

En cas de découverte d'une vulnérabilité de sécurité, contactez l'équipe immédiatement.
