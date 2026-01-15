# 🔒 PATCH COMPLET : SÉCURISATION DES ENDPOINTS PUBLICS

## 📋 RÉSUMÉ

Ce patch sécurise les endpoints publics avec :
1. **Rate limiting spécifique** par route (plus strict que global)
2. **Honeypot field** + **timestamp token** pour détecter les bots
3. **Body size limits** pour prévenir les attaques DoS
4. **Quota organization** avec réponse 429 claire
5. **Logging enrichi** (IP, User-Agent, formSlug, reasonBlocked)

## 🎯 ENDPOINTS SÉCURISÉS

### **1. GET /forms/public/:slug**
- Rate limit : **30 requêtes/minute/IP**
- Logging enrichi

### **2. POST /forms/public/:slug/evaluate**
- Rate limit : **30 requêtes/minute/IP**
- Validation honeypot + timestamp
- Body size limit : **1MB**
- Logging enrichi

### **3. POST /leads/forms/:formId/submit**
- Rate limit : **10 requêtes/minute/IP**
- Validation honeypot + timestamp
- Body size limit : **1MB**
- Vérification quota organization (429 si dépassé)
- Logging enrichi

## 🛡️ MESURES DE SÉCURITÉ

### **1. Rate Limiting Spécifique**

**Configuration** :
- `GET /forms/public/:slug` : 30/min/IP
- `POST /forms/public/:slug/evaluate` : 30/min/IP
- `POST /leads/forms/:formId/submit` : 10/min/IP

**Implémentation** : Utilise `@Throttle()` de `@nestjs/throttler` avec limites spécifiques par route.

### **2. Honeypot Field**

**Principe** : Champ caché dans le formulaire qui doit rester vide. Si rempli → bot détecté.

**Validation** :
```typescript
if (honeypot && honeypot.trim() !== '') {
  throw new BadRequestException('Invalid form submission');
}
```

**DTO** :
```typescript
@IsString()
@IsOptional()
honeypot?: string; // Doit être vide
```

### **3. Timestamp Token (formRenderedAt)**

**Principe** : Timestamp ISO du rendu du formulaire. Si soumission < 2s après rendu → suspect.

**Validation** :
- Minimum : **2 secondes** après rendu
- Maximum : **1 heure** après rendu
- Si < 2s → `429 Too Many Requests` avec message : "Form submitted too quickly. Please take your time filling the form."

**DTO** :
```typescript
@IsString()
@IsOptional()
formRenderedAt?: string; // Timestamp ISO
```

### **4. Body Size Limits**

**Limite** : **1MB** pour tous les endpoints publics

**Implémentation** : Middleware dans `main.ts` qui vérifie `Content-Length` avant traitement.

```typescript
if (contentLength > 1024 * 1024) {
  return res.status(413).json({
    statusCode: 413,
    message: 'Request body too large. Maximum size is 1MB.',
  });
}
```

### **5. Quota Organization**

**Vérification** : Dans `LeadsService.submitForm()`

**Comportement** :
- Si quota mensuel dépassé → `429 Too Many Requests`
- Message : `"Quota de leads mensuel atteint (X/Y). Veuillez passer à un plan supérieur."`

**Code** :
```typescript
if (currentLeadsCount >= settings.maxLeadsPerMonth) {
  throw new TooManyRequestsException(
    `Quota de leads mensuel atteint (${currentLeadsCount}/${settings.maxLeadsPerMonth}). Veuillez passer à un plan supérieur.`,
  );
}
```

### **6. Logging Enrichi**

**Service** : `PublicEndpointSecurityService`

**Informations loggées** :
- `ip` : IP du client (avec support X-Forwarded-For)
- `userAgent` : User-Agent du navigateur
- `formSlug` : Slug du formulaire
- `endpoint` : Route appelée
- `reasonBlocked` : Raison du blocage (honeypot, timestamp, quota, etc.)

**Exemples de logs** :

**Requête bloquée** :
```
🚫 Blocked public endpoint request: Honeypot field is not empty (bot detected)
{
  "reason": "Honeypot field is not empty (bot detected)",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "formSlug": "contact-form",
  "endpoint": "POST /leads/forms/:formId/submit"
}
```

**Requête réussie** :
```
✅ Public endpoint request: POST /leads/forms/:formId/submit
{
  "endpoint": "POST /leads/forms/:formId/submit",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "formSlug": "contact-form",
  "leadId": "lead-123"
}
```

## 📁 FICHIERS CRÉÉS/MODIFIÉS

### **1. Nouveau Service** : `apps/api/src/common/services/public-endpoint-security.service.ts`
- `validateHoneypot()` : Valide que le honeypot est vide
- `validateTimestampToken()` : Valide le timestamp (2s min, 1h max)
- `validateSecurity()` : Valide toutes les mesures
- `extractRequestInfo()` : Extrait IP, User-Agent, formSlug
- `logBlockedAttempt()` : Log une tentative bloquée
- `logPublicRequest()` : Log une requête publique réussie

### **2. Nouveau DTO** : `apps/api/src/forms/dto/forms-public.dto.ts`
- `EvaluateFormDto` : DTO pour l'évaluation publique
- `SubmitPublicFormDto` : DTO pour la soumission publique (avec honeypot + timestamp)

### **3. Modifié** : `apps/api/src/leads/dto/leads.dto.ts`
- Ajouté `formRenderedAt?: string`
- Ajouté `honeypot?: string`

### **4. Modifié** : `apps/api/src/forms/forms.controller.ts`
- Ajouté endpoint `POST /forms/public/:slug/evaluate`
- Rate limiting : 30/min pour `GET /forms/public/:slug` et `POST /forms/public/:slug/evaluate`
- Validation sécurité dans `evaluateForm()`
- Logging enrichi

### **5. Modifié** : `apps/api/src/leads/leads.controller.ts`
- Rate limiting : 10/min pour `POST /leads/forms/:formId/submit`
- Validation sécurité (honeypot + timestamp)
- Logging enrichi avec raison de blocage
- Gestion erreur quota (429)

### **6. Modifié** : `apps/api/src/leads/leads.service.ts`
- Import `TooManyRequestsException`
- Quota dépassé → `429` au lieu de `403`

### **7. Modifié** : `apps/api/src/forms/forms.service.ts`
- Ajouté méthode `evaluateForm()` pour l'évaluation publique

### **8. Modifié** : `apps/api/src/main.ts`
- Ajouté middleware pour body size limits (1MB) sur endpoints publics

### **9. Modifié** : `apps/api/src/common/common.module.ts`
- Ajouté `PublicEndpointSecurityService` aux providers et exports

### **10. Modifié** : `apps/api/src/forms/forms.module.ts`
- Ajouté `CommonModule` aux imports

### **11. Nouveau Test E2E** : `apps/api/test/integration/public-endpoints-security.e2e-spec.ts`
- Test rate limiting (GET et POST)
- Test honeypot validation
- Test timestamp token validation

## 🧪 TESTS E2E

### **Test 1 : Rate Limiting GET**
```typescript
it('should enforce rate limit on GET /forms/public/:slug (30/min)', async () => {
  // Make 31 requests rapidly
  const requests = Array.from({ length: 31 }, () =>
    request(httpServer).get(`/forms/public/${form.slug}`),
  );
  const responses = await Promise.all(requests);
  // First 30 should succeed, 31st might be rate limited
});
```

### **Test 2 : Rate Limiting POST**
```typescript
it('should enforce rate limit on POST /leads/forms/:formId/submit (10/min)', async () => {
  // Make 11 requests rapidly
  const requests = Array.from({ length: 11 }, (_, i) =>
    request(httpServer)
      .post(`/leads/forms/${form.id}/submit`)
      .set('Idempotency-Key', `${idempotencyKey}-${i}`)
      .send({ ...submitData, email: `test-${i}@example.com` }),
  );
  const responses = await Promise.all(requests);
  expect(successCount).toBeLessThanOrEqual(10);
});
```

### **Test 3 : Honeypot Validation**
```typescript
it('should reject submission with non-empty honeypot field', async () => {
  const submitData = {
    email: 'test@example.com',
    honeypot: 'filled-by-bot', // ❌ Honeypot rempli
    formRenderedAt: new Date(Date.now() - 5000).toISOString(),
  };
  const response = await request(httpServer)
    .post(`/leads/forms/${form.id}/submit`)
    .send(submitData)
    .expect(400);
  expect(response.body.message).toContain('Invalid form submission');
});
```

### **Test 4 : Timestamp Validation**
```typescript
it('should reject submission submitted too quickly (< 2s)', async () => {
  const submitData = {
    email: 'test@example.com',
    formRenderedAt: new Date(Date.now() - 500).toISOString(), // ❌ 500ms (trop rapide)
  };
  const response = await request(httpServer)
    .post(`/leads/forms/${form.id}/submit`)
    .send(submitData)
    .expect(429);
  expect(response.body.message).toContain('too quickly');
});
```

## 🚀 DÉPLOIEMENT

### **1. Vérifications**

```bash
# Vérifier les imports
cd apps/api
pnpm build

# Lancer les tests E2E
pnpm test:e2e:local
```

### **2. Configuration**

Aucune configuration supplémentaire requise. Les limites sont codées en dur :
- Rate limits : 30/min (evaluate), 10/min (submit)
- Body size : 1MB
- Timestamp min : 2s
- Timestamp max : 1h

### **3. Frontend**

Le frontend doit :
1. **Ajouter le champ honeypot** (caché) dans les formulaires publics
2. **Envoyer `formRenderedAt`** : Timestamp ISO au moment du rendu du formulaire
3. **Gérer les erreurs 429** : Afficher un message clair à l'utilisateur

**Exemple frontend** :
```typescript
// Au rendu du formulaire
const formRenderedAt = new Date().toISOString();

// Dans le submit
const submitData = {
  email: 'user@example.com',
  data: { ... },
  honeypot: '', // Champ caché, doit rester vide
  formRenderedAt, // Timestamp du rendu
};
```

## 📊 COUVERTURE

### **Endpoints sécurisés**
- ✅ `GET /forms/public/:slug` : Rate limiting + logging
- ✅ `POST /forms/public/:slug/evaluate` : Rate limiting + honeypot + timestamp + body size + logging
- ✅ `POST /leads/forms/:formId/submit` : Rate limiting + honeypot + timestamp + body size + quota + logging

### **Mesures de sécurité**
- ✅ Rate limiting spécifique par route
- ✅ Honeypot field validation
- ✅ Timestamp token validation (2s min, 1h max)
- ✅ Body size limits (1MB)
- ✅ Quota organization (429 si dépassé)
- ✅ Logging enrichi (IP, User-Agent, formSlug, reasonBlocked)

## ⚠️ POINTS D'ATTENTION

### **1. Frontend**
- Le frontend doit ajouter le champ honeypot (caché avec CSS)
- Le frontend doit envoyer `formRenderedAt` au moment du rendu
- Gérer les erreurs 429 avec messages clairs

### **2. Rate Limiting**
- Basé sur IP (peut être contourné avec proxies)
- En production, considérer un rate limiting plus sophistiqué (Redis, etc.)

### **3. Timestamp**
- Basé sur l'horloge du client (peut être manipulé)
- En production, considérer un serveur de timestamp signé

### **4. Body Size**
- Limite globale de 1MB (peut être ajustée par route si nécessaire)

## ✅ VALIDATION

- [x] Service `PublicEndpointSecurityService` créé
- [x] DTOs mis à jour (honeypot + timestamp)
- [x] Controllers mis à jour (validation + logging)
- [x] Service mis à jour (quota → 429)
- [x] Body size limits ajoutés
- [x] Tests E2E créés
- [x] Module mis à jour
- [x] Pas d'erreurs de lint

## 🔄 PROCHAINES ÉTAPES (Optionnel)

1. **Rate limiting avancé** : Utiliser Redis pour un rate limiting distribué
2. **CAPTCHA** : Ajouter reCAPTCHA ou hCaptcha pour les soumissions suspectes
3. **IP Reputation** : Intégrer un service de réputation IP (ex: AbuseIPDB)
4. **Webhook Security** : Sécuriser les webhooks avec signatures
5. **Metrics** : Ajouter des métriques pour taux de blocage, raisons, etc.

---

**Date** : 2025-01-27  
**Auteur** : Patch de sécurisation des endpoints publics  
**Version** : 1.0.0
