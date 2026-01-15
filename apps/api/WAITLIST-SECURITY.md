# Sécurité de la Waitlist - Documentation

## Vue d'ensemble

La waitlist KLOZD implémente plusieurs couches de sécurité pour protéger contre les abus, les bots, et les attaques malveillantes. Cette documentation décrit toutes les mesures de sécurité en place.

## Couches de sécurité

### 1. Rate Limiting (Limitation de débit)

- **Niveau 1 (Global)** : 100 requêtes par minute par IP (via ThrottlerModule)
- **Niveau 2 (Endpoint)** : 3 requêtes par minute par IP pour `/public/waitlist`
- **Protection** : Empêche les attaques par déni de service (DoS) et les soumissions massives

### 2. Validation d'email avancée

#### Format et longueur
- Validation regex stricte : `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`
- Longueur minimale : 5 caractères
- Longueur maximale : 254 caractères (RFC 5321)
- Normalisation : conversion en lowercase et trim

#### Domaines jetables (Disposable emails)
- Liste de 30+ domaines d'emails temporaires bloqués
- Détection automatique et rejet
- Exemples : `10minutemail.com`, `guerrillamail.com`, `mailinator.com`, etc.

#### Domaines blacklistés
- Liste configurable de domaines interdits
- Utilisable pour bloquer des domaines spécifiques (spam, fraud, etc.)

#### Patterns suspects
- Détection d'emails avec patterns suspects (`test123@`, `user456@`, etc.)
- Logging automatique pour analyse

### 3. Honeypot (Piège à bots)

- Champ invisible dans le formulaire
- Si rempli → bot détecté → rejet automatique
- Invisible pour les utilisateurs légitimes

### 4. Validation de timestamp (formRenderedAt)

- Temps minimum de remplissage : 2 secondes
- Temps maximum de validité : 1 heure
- Protection contre les soumissions automatiques trop rapides
- Protection contre les formulaires obsolètes

### 5. Sanitization des inputs

- Suppression des caractères de contrôle (`\x00-\x1F`, `\x7F`)
- Limitation de longueur par champ
- Trim automatique
- Protection contre les injections XSS et SQL

### 6. Validation des valeurs enum

- **Rôle** : Seulement `infopreneur`, `closer`, `setter`, `manager`, `other`
- **Volume de leads** : Seulement `0-50`, `50-200`, `200-500`, `500+`
- Rejet automatique des valeurs invalides

### 7. Détection d'activité suspecte

#### Même email, IPs différentes
- Détection si un email est utilisé avec plusieurs IPs dans les 24h
- Flag comme suspect (logging, pas de blocage automatique)

#### Trop d'inscriptions depuis une IP
- Limite : 10 inscriptions par heure par IP
- Détection automatique et flag

#### Emails similaires
- Détection de patterns de spam (emails avec préfixes similaires)
- Limite : 5 emails similaires par heure
- Protection contre les attaques automatisées

### 8. Validation du User-Agent

- Détection des bots connus (curl, wget, python, etc.)
- Logging des User-Agents suspects
- Pas de blocage automatique (peut être légitime pour tests)

### 9. Protection contre les race conditions

- Vérification d'unicité de l'email avant insertion
- Utilisation de contrainte unique en base de données
- Protection contre les soumissions simultanées

### 10. Logging et monitoring

#### Logs de sécurité
- Toutes les tentatives bloquées sont loggées
- Informations : IP, User-Agent, email, raison du blocage
- Format structuré JSON pour analyse

#### Logs de succès
- Toutes les inscriptions réussies sont loggées
- Informations : IP, User-Agent, email, UTM parameters
- Traçabilité complète

#### Métriques
- Compteurs de tentatives bloquées
- Compteurs d'inscriptions réussies
- Détection d'anomalies

## Configuration

### Variables d'environnement

```env
# Trust proxy (pour détection IP correcte derrière reverse proxy)
TRUST_PROXY=true

# Rate limiting (configuré dans ThrottlerModule)
# Défaut : 3 requêtes/minute pour /public/waitlist
```

### Personnalisation

#### Ajouter des domaines jetables

Modifier `WaitlistSecurityService.DISPOSABLE_EMAIL_DOMAINS` dans :
`apps/api/src/waitlist/services/waitlist-security.service.ts`

#### Ajouter des domaines blacklistés

Modifier `WaitlistSecurityService.BLACKLISTED_DOMAINS` dans :
`apps/api/src/waitlist/services/waitlist-security.service.ts`

#### Ajuster les limites

Modifier les constantes dans `WaitlistSecurityService` :
- `MAX_ENTRIES_PER_IP_PER_HOUR` : Limite d'inscriptions par IP/heure
- `MAX_SIMILAR_EMAILS_PER_HOUR` : Limite d'emails similaires/heure

## Tests de sécurité

Des tests unitaires sont disponibles dans :
`apps/api/src/waitlist/services/waitlist-security.service.spec.ts`

Pour exécuter :
```bash
cd apps/api
pnpm test waitlist-security.service.spec.ts
```

## Monitoring et alertes

### Recommandations

1. **Surveiller les logs** :
   - Alertes sur taux de blocage élevé
   - Alertes sur patterns suspects répétés
   - Alertes sur tentatives depuis IPs multiples

2. **Métriques à suivre** :
   - Nombre de tentatives bloquées par heure
   - Nombre d'inscriptions réussies par heure
   - Taux de rejet (blocked/total)
   - Top IPs sources

3. **Alertes automatiques** :
   - Plus de 50 tentatives bloquées en 1h
   - Plus de 20 inscriptions depuis une même IP en 1h
   - Détection de pattern de spam (emails similaires)

## Améliorations futures possibles

1. **CAPTCHA** : Intégration optionnelle de reCAPTCHA v3 pour détection avancée
2. **Vérification MX** : Vérification que le domaine email a des enregistrements MX valides
3. **Réputation IP** : Intégration avec des services de réputation IP (AbuseIPDB, etc.)
4. **Machine Learning** : Détection de patterns suspects via ML
5. **Double opt-in** : Confirmation par email avant inscription définitive

## Conformité

- **RGPD** : Les données collectées sont minimales et nécessaires
- **Consentement** : Implicite via soumission du formulaire
- **Rétention** : Configurable via DataRetentionService
- **Droit à l'oubli** : Suppression possible via endpoint admin

## Support

Pour toute question sur la sécurité de la waitlist, contacter l'équipe technique.
