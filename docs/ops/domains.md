# Configuration DNS et Domaines KLOZD

## Architecture des domaines

| Domaine | Usage | Hébergement | Type |
|---------|-------|-------------|------|
| `klozd.com` | Marketing (landing + waitlist) | Vercel (ou autre) | Apex |
| `www.klozd.com` | Redirection vers apex | Vercel | CNAME |
| `my.klozd.com` | Application Next.js (apps/web) | Vercel | CNAME |
| `api.klozd.com` | API NestJS | OVH Managed Kubernetes | A (IP LoadBalancer) |

## A. Architecture DNS cible

### Table des enregistrements DNS

| Type | Host | Cible | TTL | Notes |
|------|------|-------|-----|-------|
| **A** | `@` (klozd.com) | IP Vercel (si marketing sur Vercel) | 3600 | Apex domain - Vercel fournit l'IP |
| **CNAME** | `www` | `cname.vercel-dns.com` | 3600 | Redirection www → apex |
| **CNAME** | `my` | `cname.vercel-dns.com` | 3600 | Sous-domaine app (Vercel) |
| **A** | `api` | `<IP_LOADBALANCER_OVH>` | 300 | IP du LoadBalancer Kubernetes |

**⚠️ Important :**
- Ne pas créer à la fois un CNAME et un A record pour le même host
- Pour `klozd.com` (apex) : utiliser A record si marketing sur Vercel, sinon utiliser le DNS du fournisseur marketing
- TTL recommandé : 300-3600 secondes (5 min - 1h)
- TTL court (300) pour `api` permet un changement rapide en cas de problème

### Cas 1 : Marketing sur Vercel

```
klozd.com          A     → IP Vercel (fournie par Vercel)
www.klozd.com      CNAME → cname.vercel-dns.com
my.klozd.com       CNAME → cname.vercel-dns.com
api.klozd.com      A     → <IP_LOADBALANCER_OVH>
```

### Cas 2 : Marketing ailleurs (ex: Netlify, Cloudflare Pages)

```
klozd.com          A     → IP fournisseur marketing
www.klozd.com      CNAME → cname.fournisseur.com
my.klozd.com       CNAME → cname.vercel-dns.com
api.klozd.com      A     → <IP_LOADBALANCER_OVH>
```

## B. Configuration Vercel

### Projet apps/web (my.klozd.com)

1. **Ajouter le domaine dans Vercel :**
   - Aller dans le projet `apps/web` sur Vercel
   - Settings → Domains
   - Ajouter `my.klozd.com`
   - Vercel affichera les enregistrements DNS à créer

2. **Configuration du domaine :**
   - Vercel détecte automatiquement le domaine
   - HTTPS est automatiquement provisionné via Let's Encrypt
   - Redirection HTTP → HTTPS automatique

3. **Variables d'environnement Vercel :**
   ```env
   NEXT_PUBLIC_API_URL=https://api.klozd.com
   NEXT_PUBLIC_APP_URL=https://my.klozd.com
   ```

### Projet apps/marketing (klozd.com) - Si sur Vercel

1. **Ajouter le domaine apex :**
   - Settings → Domains
   - Ajouter `klozd.com`
   - Vercel fournira une IP à utiliser dans le DNS (A record)

2. **Ajouter www :**
   - Ajouter `www.klozd.com`
   - Vercel redirige automatiquement vers `klozd.com`

3. **Redirections automatiques :**
   - `www.klozd.com` → `klozd.com` (automatique)
   - `http://klozd.com` → `https://klozd.com` (automatique)

4. **Variables d'environnement Vercel :**
   ```env
   NEXT_PUBLIC_API_URL=https://api.klozd.com
   NEXT_PUBLIC_APP_URL=https://my.klozd.com
   ```

## C. Configuration OVH DNS (zone klozd.com)

### Enregistrements à créer dans OVH DNS Manager

#### Cas 1 : Marketing sur Vercel

1. **Apex domain (klozd.com) :**
   - Type : **A**
   - Sous-domaine : `@` (ou laisser vide)
   - Cible : IP fournie par Vercel (ex: `76.76.21.21`)
   - TTL : 3600

2. **www :**
   - Type : **CNAME**
   - Sous-domaine : `www`
   - Cible : `cname.vercel-dns.com` (ou valeur fournie par Vercel)
   - TTL : 3600

3. **my (app) :**
   - Type : **CNAME**
   - Sous-domaine : `my`
   - Cible : `cname.vercel-dns.com` (ou valeur fournie par Vercel)
   - TTL : 3600

4. **api :**
   - Type : **A**
   - Sous-domaine : `api`
   - Cible : `<IP_LOADBALANCER_OVH>` (voir section D pour récupérer l'IP)
   - TTL : 300

#### Cas 2 : Marketing ailleurs

1. **Apex domain (klozd.com) :**
   - Type : **A**
   - Sous-domaine : `@`
   - Cible : IP fournisseur marketing
   - TTL : 3600

2. **www :**
   - Type : **CNAME**
   - Sous-domaine : `www`
   - Cible : CNAME fournisseur marketing
   - TTL : 3600

3. **my (app) :**
   - Type : **CNAME**
   - Sous-domaine : `my`
   - Cible : `cname.vercel-dns.com`
   - TTL : 3600

4. **api :**
   - Type : **A**
   - Sous-domaine : `api`
   - Cible : `<IP_LOADBALANCER_OVH>`
   - TTL : 300

## D. Configuration OVH Managed Kubernetes (MKS) pour api.klozd.com

### 1. Récupérer l'IP du LoadBalancer

```bash
# Lister les services de type LoadBalancer
kubectl get svc -n ingress-nginx

# Récupérer l'IP externe
kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

Cette IP doit être utilisée dans le DNS OVH pour le record A de `api.klozd.com`.

### 2. Ingress NGINX Configuration

Créer un fichier `ingress-api.yaml` :

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: klozd-api-ingress
  namespace: default
  annotations:
    # Cert-manager pour Let's Encrypt
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    # NGINX Ingress Controller
    kubernetes.io/ingress.class: "nginx"
    # Body size (ajuster selon besoins)
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    # Timeouts
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
    # Trust proxy (important pour X-Forwarded-For)
    nginx.ingress.kubernetes.io/configuration-snippet: |
      more_set_headers "X-Real-IP $remote_addr";
      more_set_headers "X-Forwarded-For $proxy_add_x_forwarded_for";
      more_set_headers "X-Forwarded-Proto $scheme";
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.klozd.com
      secretName: api-klozd-com-tls
  rules:
    - host: api.klozd.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: klozd-api-service
                port:
                  number: 3001
```

### 3. Service LoadBalancer

Créer un fichier `service-api.yaml` :

```yaml
apiVersion: v1
kind: Service
metadata:
  name: klozd-api-service
  namespace: default
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 3001
      protocol: TCP
      name: http
    - port: 443
      targetPort: 3001
      protocol: TCP
      name: https
  selector:
    app: klozd-api
```

### 4. Cert-manager + Let's Encrypt

#### ClusterIssuer pour Let's Encrypt

Créer `cluster-issuer.yaml` :

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@klozd.com  # ⚠️ Remplacer par votre email
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
```

#### Installation cert-manager (si pas déjà installé)

```bash
# Installer cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Vérifier l'installation
kubectl get pods -n cert-manager
```

### 5. Déploiement de l'API

Exemple de Deployment (à adapter selon votre configuration) :

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: klozd-api
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: klozd-api
  template:
    metadata:
      labels:
        app: klozd-api
    spec:
      containers:
        - name: api
          image: your-registry/klozd-api:latest
          ports:
            - containerPort: 3001
          env:
            - name: NODE_ENV
              value: "production"
            - name: FRONTEND_URL
              value: "https://my.klozd.com"
            - name: TRUST_PROXY
              value: "true"
            - name: COOKIE_DOMAIN
              value: "my.klozd.com"
            # ... autres variables d'environnement
```

### 6. Appliquer les configurations

```bash
# Appliquer ClusterIssuer
kubectl apply -f cluster-issuer.yaml

# Appliquer Service
kubectl apply -f service-api.yaml

# Appliquer Ingress
kubectl apply -f ingress-api.yaml

# Vérifier le certificat
kubectl get certificate -n default
kubectl describe certificate api-klozd-com-tls -n default
```

## E. CORS + Cookies

### Configuration CORS côté API

L'API NestJS doit autoriser les requêtes depuis `my.klozd.com` :

```typescript
// apps/api/src/main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'https://my.klozd.com',
  credentials: true, // Important pour les cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-CSRF-Token'],
});
```

### Configuration Cookies

**Stratégie recommandée : Domain = `my.klozd.com` (pas `.klozd.com`)**

**Pourquoi ?**
- Sécurité : les cookies ne sont partagés que sur `my.klozd.com`
- Isolation : pas de partage avec `klozd.com` ou `api.klozd.com`
- Pas de besoin SSO entre domaines

**Configuration dans `apps/api/src/auth/auth.controller.ts` :**

```typescript
const cookieOptions = {
  httpOnly: true,
  secure: true, // HTTPS uniquement en production
  sameSite: 'lax' as const,
  domain: process.env.COOKIE_DOMAIN || 'my.klozd.com', // ⚠️ Pas de point au début
  path: '/',
  maxAge: result.refreshTokenExpiresAt.getTime() - Date.now(),
};
```

**⚠️ Important :**
- `domain: 'my.klozd.com'` (sans point) = cookie uniquement sur my.klozd.com
- `domain: '.klozd.com'` (avec point) = cookie partagé sur tous les sous-domaines
- En production : `secure: true` (HTTPS uniquement)
- `sameSite: 'lax'` pour la compatibilité

### TRUST_PROXY

**Côté API (derrière Ingress/LB) :**

```env
TRUST_PROXY=true
```

Cela permet à l'API de lire correctement `X-Forwarded-For` et `X-Real-IP` depuis l'Ingress NGINX.

## F. Variables d'environnement

### apps/api/.env.example

```env
# Application
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@host:5432/klozd

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m

# Frontend & CORS
FRONTEND_URL=https://my.klozd.com
CORS_ORIGINS=https://my.klozd.com,https://klozd.com
COOKIE_DOMAIN=my.klozd.com

# API Base URL
API_BASE_URL=https://api.klozd.com

# Trust Proxy (important derrière Ingress/LB)
TRUST_PROXY=true

# Redis (pour distributed locks)
REDIS_URL=redis://redis-host:6379

# Email (Resend)
RESEND_API_KEY=re_xxxxx

# Other services...
```

### apps/web/.env.example

```env
# API
NEXT_PUBLIC_API_URL=https://api.klozd.com

# App URL
NEXT_PUBLIC_APP_URL=https://my.klozd.com

# Environment
NODE_ENV=production
```

### apps/marketing/.env.example

```env
# API
NEXT_PUBLIC_API_URL=https://api.klozd.com

# App URL (pour liens vers l'app)
NEXT_PUBLIC_APP_URL=https://my.klozd.com

# Environment
NODE_ENV=production
```

## G. Checklist Go-Live

### Pré-déploiement

- [ ] DNS configuré dans OVH (records A et CNAME)
- [ ] IP LoadBalancer Kubernetes récupérée et configurée dans DNS
- [ ] Domaines ajoutés dans Vercel (my.klozd.com, klozd.com si applicable)
- [ ] Cert-manager installé et ClusterIssuer configuré
- [ ] Ingress NGINX configuré avec annotations correctes
- [ ] Variables d'environnement configurées dans Vercel et Kubernetes

### Post-déploiement - Vérifications DNS

- [ ] `klozd.com` résout correctement (propagation DNS vérifiée)
- [ ] `www.klozd.com` redirige vers `klozd.com`
- [ ] `my.klozd.com` résout vers Vercel
- [ ] `api.klozd.com` résout vers l'IP du LoadBalancer

**Commandes de vérification :**
```bash
# Vérifier la résolution DNS
dig klozd.com
dig www.klozd.com
dig my.klozd.com
dig api.klozd.com

# Ou avec nslookup
nslookup klozd.com
nslookup api.klozd.com
```

### Post-déploiement - Vérifications HTTPS

- [ ] `https://klozd.com` fonctionne (certificat valide)
- [ ] `https://www.klozd.com` redirige vers `https://klozd.com`
- [ ] `https://my.klozd.com` fonctionne (certificat Vercel)
- [ ] `https://api.klozd.com` fonctionne (certificat Let's Encrypt)

**Commandes de vérification :**
```bash
# Vérifier le certificat
openssl s_client -connect api.klozd.com:443 -servername api.klozd.com

# Vérifier avec curl
curl -I https://api.klozd.com
curl -I https://my.klozd.com
curl -I https://klozd.com
```

### Post-déploiement - Vérifications API

- [ ] `https://api.klozd.com/health` répond `200 OK`
- [ ] Headers CORS présents dans les réponses
- [ ] `Access-Control-Allow-Origin: https://my.klozd.com` présent
- [ ] `Access-Control-Allow-Credentials: true` présent

**Commandes de vérification :**
```bash
# Health check
curl https://api.klozd.com/health

# Vérifier CORS (OPTIONS request)
curl -X OPTIONS https://api.klozd.com/auth/login \
  -H "Origin: https://my.klozd.com" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

### Post-déploiement - Vérifications Cookies

- [ ] Cookies `refreshToken` sont `HttpOnly`
- [ ] Cookies `refreshToken` ont `Secure=true` en production
- [ ] Cookies `refreshToken` ont `SameSite=Lax`
- [ ] Cookies `refreshToken` ont `Domain=my.klozd.com` (pas `.klozd.com`)
- [ ] Cookies `csrfToken` sont non-HttpOnly (pour JavaScript)

**Vérification dans le navigateur :**
1. Ouvrir `https://my.klozd.com/login`
2. Se connecter
3. DevTools → Application → Cookies
4. Vérifier les attributs du cookie `refreshToken`

### Post-déploiement - Vérifications Fonctionnelles

- [ ] Login fonctionne sur `https://my.klozd.com/login`
- [ ] Refresh token fonctionne (cookie envoyé automatiquement)
- [ ] Logout fonctionne (cookie supprimé)
- [ ] Requêtes API depuis `my.klozd.com` vers `api.klozd.com` fonctionnent
- [ ] CORS ne bloque pas les requêtes
- [ ] Waitlist fonctionne depuis `https://klozd.com/waitlist`

### Post-déploiement - Monitoring

- [ ] Logs API accessibles (Kubernetes logs)
- [ ] Métriques disponibles (si monitoring configuré)
- [ ] Alertes configurées (si système d'alerting en place)

## H. Dépannage

### Problème : Certificat SSL non généré

```bash
# Vérifier le ClusterIssuer
kubectl get clusterissuer

# Vérifier le Certificate
kubectl get certificate -n default
kubectl describe certificate api-klozd-com-tls -n default

# Vérifier les challenges ACME
kubectl get challenges -n default

# Logs cert-manager
kubectl logs -n cert-manager -l app=cert-manager
```

### Problème : CORS bloque les requêtes

1. Vérifier `FRONTEND_URL` dans l'API
2. Vérifier que `origin` dans la requête correspond exactement
3. Vérifier les headers `Access-Control-Allow-Origin` dans la réponse

### Problème : Cookies non envoyés

1. Vérifier `withCredentials: true` côté frontend (Axios)
2. Vérifier `credentials: true` dans CORS côté API
3. Vérifier que le domaine du cookie correspond au domaine de la requête
4. Vérifier `Secure=true` uniquement en HTTPS

### Problème : IP client incorrecte

1. Vérifier `TRUST_PROXY=true` dans l'API
2. Vérifier les annotations Ingress NGINX pour `X-Forwarded-For`
3. Vérifier que l'Ingress transmet bien les headers

## I. Maintenance

### Mise à jour de l'IP LoadBalancer

Si l'IP du LoadBalancer change (rare mais possible) :

1. Récupérer la nouvelle IP :
   ```bash
   kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
   ```

2. Mettre à jour le record A dans OVH DNS :
   - Aller dans OVH DNS Manager
   - Modifier le record A de `api.klozd.com`
   - Mettre à jour avec la nouvelle IP
   - TTL court (300) permet une propagation rapide

### Renouvellement des certificats

Let's Encrypt renouvelle automatiquement les certificats (valides 90 jours, renouvelés à 30 jours avant expiration).

Vérifier le renouvellement :
```bash
kubectl get certificate -n default -w
```

## J. Références

- [Vercel Domains Documentation](https://vercel.com/docs/concepts/projects/domains)
- [OVH DNS Manager](https://www.ovh.com/manager/web/#/domain)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [cert-manager Documentation](https://cert-manager.io/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
