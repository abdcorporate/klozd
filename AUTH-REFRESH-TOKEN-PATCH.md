# 🔐 PATCH COMPLET : MIGRATION VERS ACCESS TOKEN + REFRESH TOKEN

## 📋 RÉSUMÉ

Ce patch migre le système d'authentification vers :
- **Access token court** : 15 minutes (JWT)
- **Refresh token long** : 7-30 jours (stocké en cookie HttpOnly Secure SameSite=Lax)
- **Rotation automatique** : Le refresh token est roté à chaque utilisation
- **Refresh automatique** : Le frontend refresh automatiquement l'access token sur 401

## 🎯 BACKEND (apps/api)

### **1. Table Prisma : `RefreshToken`**

```prisma
model RefreshToken {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash     String    // Hash du refresh token (bcrypt)
  createdAt     DateTime  @default(now())
  expiresAt     DateTime  // Date d'expiration (7-30 jours)
  revokedAt     DateTime? // Date de révocation (si logout ou rotation)
  replacedById  String?   // ID du refresh token qui a remplacé celui-ci (rotation)
  replacedBy    RefreshToken? @relation("RefreshTokenReplacement", fields: [replacedById], references: [id])
  replacedTokens RefreshToken[] @relation("RefreshTokenReplacement")
  userAgent     String?   // User-Agent du navigateur
  ip            String?   // Adresse IP

  @@index([userId])
  @@index([tokenHash])
  @@index([expiresAt])
  @@index([revokedAt])
  @@map("refresh_tokens")
}
```

### **2. Service : `RefreshTokenService`**

**Méthodes principales** :
- `generateRefreshToken()` : Génère un token aléatoire (64 bytes hex)
- `hashRefreshToken(token)` : Hash avec bcrypt (salt rounds 10)
- `verifyRefreshToken(token, hash)` : Vérifie le token contre le hash
- `createRefreshToken(userId, token, userAgent?, ip?)` : Crée un refresh token en DB
- `findValidRefreshToken(userId, token)` : Trouve un token valide
- `revokeRefreshToken(tokenId, replacedById?)` : Révoque un token
- `rotateRefreshToken(oldTokenId, userId, userAgent?, ip?)` : Rotation (invalide l'ancien, crée un nouveau)

### **3. Modifications `AuthService`**

**`login()`** :
- Génère access token (15 min) via JWT
- Génère refresh token (7-30 jours) via `RefreshTokenService`
- Hash le refresh token avec bcrypt
- Stocke en DB avec `userAgent` et `ip`
- Retourne `{ accessToken, refreshToken, refreshTokenExpiresAt, user }`

**`refreshAccessToken()`** :
- Lit le refresh token depuis le cookie
- Vérifie en DB (hash comparison)
- Vérifie que l'utilisateur est actif
- Génère nouveau access token (15 min)
- **Rotation** : Invalide l'ancien token, crée un nouveau
- Retourne `{ accessToken, refreshToken, refreshTokenExpiresAt }`

**`logout()`** :
- Lit le refresh token depuis le cookie
- Révoque le token en DB (`revokedAt = now()`)
- Idempotent (ne fait rien si token déjà invalide)

### **4. Modifications `AuthController`**

**`POST /auth/login`** :
- Appelle `authService.login()`
- Set cookie `refreshToken` avec options :
  - `httpOnly: true`
  - `secure: isProduction`
  - `sameSite: 'lax'`
  - `maxAge: refreshTokenExpiresAt - now()`
- Retourne JSON : `{ accessToken, user }` (pas le refresh token)

**`POST /auth/refresh`** :
- Lit cookie `refreshToken`
- Appelle `authService.refreshAccessToken()`
- Set nouveau cookie `refreshToken` (rotation)
- Retourne JSON : `{ accessToken }`

**`POST /auth/logout`** :
- Requiert `JwtAuthGuard` (access token)
- Lit cookie `refreshToken`
- Appelle `authService.logout()`
- Clear cookie `refreshToken`
- Retourne JSON : `{ message: 'Déconnexion réussie' }`

**`GET /auth/me`** :
- Requiert `JwtAuthGuard`
- Retourne les infos complètes de l'utilisateur
- Utilisé par le frontend pour vérifier l'authentification

### **5. Configuration**

**`auth.module.ts`** :
- Access token : `expiresIn: '15m'` (au lieu de `'7d'`)

**`main.ts`** :
- Ajout de `cookie-parser` middleware
- CORS avec `credentials: true` pour les cookies

## 🎯 FRONTEND (apps/web)

### **1. Modifications `api.ts`**

**Configuration axios** :
- `withCredentials: true` : Pour envoyer les cookies automatiquement

**Access token en mémoire** :
- Variable `accessToken` (pas localStorage)
- Fonctions `setAccessToken()` et `getAccessToken()` pour gestion

**Intercepteur request** :
- Utilise `accessToken` en mémoire (pas localStorage)

**Intercepteur response** :
- Sur 401 (sauf endpoints auth) :
  1. Si déjà en train de refresh → mettre en queue
  2. Sinon → appeler `/auth/refresh` (cookie envoyé automatiquement)
  3. Mettre à jour `accessToken` en mémoire
  4. Réessayer la requête originale
  5. Si refresh échoue → logout et rediriger vers `/login`

**Nouveaux endpoints** :
- `authApi.refresh()` : `POST /auth/refresh`
- `authApi.logout()` : `POST /auth/logout`
- `authApi.me()` : `GET /auth/me`

### **2. Modifications `auth-store.ts`**

**Nouvelles méthodes** :
- `setToken(token)` : Met à jour le token en mémoire
- `checkAuth()` : Vérifie l'authentification via `/auth/me`

**Modifications** :
- `login()` : Stocke le token en mémoire (pas localStorage)
- `register()` : Stocke le token en mémoire (pas localStorage)
- `logout()` : Appelle `/auth/logout`, puis nettoie le state
- `partialize()` : Ne persiste plus le token (seulement `user` et `isAuthenticated`)
- `onRehydrateStorage()` : Appelle `checkAuth()` si `isAuthenticated === true`

### **3. Middleware Next.js**

**`middleware.ts`** :
- Vérifie le cookie `refreshToken` pour les routes protégées
- Si pas de cookie → rediriger vers `/login?redirect=...`
- La vérification complète se fait côté client via `/auth/me`

## 📁 FICHIERS CRÉÉS/MODIFIÉS

### **Backend**

1. **Nouveau** : `apps/api/src/auth/services/refresh-token.service.ts`
   - Service complet pour gestion des refresh tokens

2. **Modifié** : `apps/api/prisma/schema.prisma`
   - Ajout table `RefreshToken` avec relations

3. **Modifié** : `apps/api/src/auth/auth.service.ts`
   - `login()` : Génère access + refresh tokens
   - `refreshAccessToken()` : Rotation du refresh token
   - `logout()` : Révoque le refresh token

4. **Modifié** : `apps/api/src/auth/auth.controller.ts`
   - `login()` : Set cookie refresh token
   - `refresh()` : Nouvel endpoint pour refresh
   - `logout()` : Nouvel endpoint pour logout
   - `me()` : Nouvel endpoint pour vérifier l'auth

5. **Modifié** : `apps/api/src/auth/auth.module.ts`
   - Access token : 15 min
   - Ajout `RefreshTokenService`

6. **Modifié** : `apps/api/src/main.ts`
   - Ajout `cookie-parser` middleware

7. **Nouveau** : `apps/api/test/integration/auth-refresh-token.e2e-spec.ts`
   - Tests E2E pour refresh rotation et logout

### **Frontend**

1. **Modifié** : `apps/web/src/lib/api.ts`
   - `withCredentials: true`
   - Access token en mémoire
   - Refresh automatique sur 401
   - Nouveaux endpoints `refresh()`, `logout()`, `me()`

2. **Modifié** : `apps/web/src/store/auth-store.ts`
   - Token en mémoire (pas localStorage)
   - Méthodes `setToken()`, `checkAuth()`
   - `logout()` async avec appel API
   - `partialize()` ne persiste plus le token

3. **Modifié** : `apps/web/src/middleware.ts`
   - Vérification cookie `refreshToken` pour routes protégées

## 🧪 TESTS E2E

### **Test 1 : Login avec refresh token en cookie**
```typescript
it('should set refresh token in HttpOnly cookie on login', async () => {
  const response = await request(httpServer)
    .post('/auth/login')
    .send({ email: user.email, password: 'password123' })
    .expect(200);

  // Vérifier access token dans JSON
  expect(response.body).toHaveProperty('accessToken');
  
  // Vérifier refresh token dans cookie HttpOnly
  const cookies = response.headers['set-cookie'];
  expect(cookies.some((c: string) => c.includes('refreshToken'))).toBe(true);
  expect(cookies.some((c: string) => c.includes('HttpOnly'))).toBe(true);
});
```

### **Test 2 : Refresh avec rotation**
```typescript
it('should rotate refresh token and return new access token', async () => {
  // 1. Login
  const loginResponse = await request(httpServer)
    .post('/auth/login')
    .send({ email: user.email, password: 'password123' })
    .expect(200);

  const cookies = loginResponse.headers['set-cookie'];
  const refreshTokenCookie = cookies.find((c: string) => c.startsWith('refreshToken='));

  // 2. Refresh
  const refreshResponse = await request(httpServer)
    .post('/auth/refresh')
    .set('Cookie', refreshTokenCookie || '')
    .expect(200);

  // Nouvel access token
  expect(refreshResponse.body).toHaveProperty('accessToken');
  expect(refreshResponse.body.accessToken).not.toBe(loginResponse.body.accessToken);

  // Nouveau cookie refresh token
  const newCookies = refreshResponse.headers['set-cookie'];
  expect(newCookies.some((c: string) => c.includes('refreshToken'))).toBe(true);

  // Ancien token révoqué
  const revokedToken = await prisma.refreshToken.findUnique({ where: { id: oldTokenId } });
  expect(revokedToken?.revokedAt).not.toBeNull();
  expect(revokedToken?.replacedById).not.toBeNull();
});
```

### **Test 3 : Logout**
```typescript
it('should revoke refresh token and clear cookie on logout', async () => {
  // 1. Login
  const loginResponse = await request(httpServer)
    .post('/auth/login')
    .send({ email: user.email, password: 'password123' })
    .expect(200);

  const accessToken = loginResponse.body.accessToken;
  const cookies = loginResponse.headers['set-cookie'];
  const refreshTokenCookie = cookies.find((c: string) => c.startsWith('refreshToken='));

  // 2. Logout
  const logoutResponse = await request(httpServer)
    .post('/auth/logout')
    .set('Authorization', `Bearer ${accessToken}`)
    .set('Cookie', refreshTokenCookie || '')
    .expect(200);

  // Cookie supprimé
  const logoutCookies = logoutResponse.headers['set-cookie'];
  const clearCookie = logoutCookies.find((c: string) => c.includes('refreshToken='));
  expect(clearCookie?.includes('Max-Age=0') || clearCookie?.includes('expires=')).toBe(true);

  // Token révoqué en DB
  const tokensAfter = await prisma.refreshToken.findMany({
    where: { userId: user.id, revokedAt: null },
  });
  expect(tokensAfter.length).toBe(0);
});
```

## 🚀 DÉPLOIEMENT

### **1. Migration Prisma**

```bash
cd apps/api
pnpm prisma migrate dev --name add_refresh_tokens
```

### **2. Installer cookie-parser**

```bash
cd apps/api
pnpm add cookie-parser
pnpm add -D @types/cookie-parser
```

### **3. Variables d'environnement**

```env
# Access token expiration (défaut: 15m)
JWT_EXPIRES_IN=15m

# Refresh token expiration (défaut: 7 jours)
REFRESH_TOKEN_EXPIRES_DAYS=7
```

### **4. Vérifications**

```bash
# Backend
cd apps/api
pnpm build
pnpm test:e2e:local

# Frontend
cd apps/web
pnpm build
```

## 📊 COUVERTURE

### **Backend**
- ✅ Table `RefreshToken` avec hash bcrypt
- ✅ Access token : 15 min
- ✅ Refresh token : 7-30 jours (configurable)
- ✅ Rotation automatique du refresh token
- ✅ Cookie HttpOnly Secure SameSite=Lax
- ✅ Endpoints : `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`
- ✅ Logout révoque le refresh token

### **Frontend**
- ✅ Access token en mémoire (pas localStorage)
- ✅ Refresh automatique sur 401
- ✅ Queue pour requêtes concurrentes pendant refresh
- ✅ Middleware Next.js vérifie cookie `refreshToken`
- ✅ Store Zustand mis à jour (pas de token dans localStorage)

## ⚠️ POINTS D'ATTENTION

### **1. cookie-parser**
- Doit être installé : `pnpm add cookie-parser @types/cookie-parser`
- Utilisé dans `main.ts` : `app.use(cookieParser())`

### **2. CORS**
- `credentials: true` est essentiel pour envoyer les cookies
- Frontend doit avoir `withCredentials: true` dans axios

### **3. Middleware Next.js**
- Ne peut pas vérifier l'access token (pas accessible)
- Vérifie seulement le cookie `refreshToken`
- La vérification complète se fait côté client via `/auth/me`

### **4. Performance**
- `findValidRefreshToken()` itère sur tous les tokens (bcrypt est lent)
- En production, considérer un index sur `tokenHash` ou un cache Redis

### **5. Sécurité**
- Refresh token hashé avec bcrypt (salt rounds 10)
- Cookie HttpOnly (pas accessible via JavaScript)
- Secure en production (HTTPS uniquement)
- SameSite=Lax (protection CSRF)

## ✅ VALIDATION

- [x] Table `RefreshToken` créée
- [x] `RefreshTokenService` créé
- [x] `AuthService` mis à jour (login, refresh, logout)
- [x] `AuthController` mis à jour (endpoints + cookies)
- [x] `AuthModule` mis à jour (15 min access token)
- [x] `main.ts` mis à jour (cookie-parser)
- [x] Frontend axios mis à jour (refresh automatique)
- [x] Frontend store mis à jour (token en mémoire)
- [x] Middleware Next.js mis à jour
- [x] Tests E2E créés
- [ ] cookie-parser à installer
- [ ] Migration Prisma à créer

## 🔄 PROCHAINES ÉTAPES

1. **Installer cookie-parser** :
   ```bash
   cd apps/api
   pnpm add cookie-parser @types/cookie-parser
   ```

2. **Créer la migration Prisma** :
   ```bash
   cd apps/api
   pnpm prisma migrate dev --name add_refresh_tokens
   ```

3. **Tester** :
   ```bash
   # Backend
   pnpm test:e2e:local

   # Frontend
   # Vérifier que le refresh automatique fonctionne
   ```

4. **Optimisations futures** :
   - Index sur `tokenHash` pour performance
   - Cache Redis pour tokens actifs
   - Nettoyage automatique des tokens expirés (cron job)

---

**Date** : 2025-01-27  
**Auteur** : Migration vers access token + refresh token  
**Version** : 1.0.0
