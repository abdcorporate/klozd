# Détection IP client avec reverse proxy

## Contexte

Lorsque l'API NestJS est déployée derrière un reverse proxy (Ingress NGINX, LoadBalancer, Cloudflare, etc.), l'IP du client n'est pas directement accessible via `req.ip` ou `req.connection.remoteAddress`. Ces valeurs contiennent l'IP du proxy, pas celle du client réel.

## Solution : Trust Proxy + X-Forwarded-For

L'application utilise le mécanisme "trust proxy" d'Express combiné avec la lecture des headers `X-Forwarded-For` et `X-Real-IP` pour détecter correctement l'IP du client.

### Architecture

```
Client (192.168.1.100)
  ↓
Reverse Proxy / LoadBalancer (10.0.0.1)
  ↓ (ajoute X-Forwarded-For: 192.168.1.100)
API NestJS (détecte 192.168.1.100)
```

### Fonctionnement

1. **Trust Proxy** : Active la confiance envers les headers de proxy
2. **X-Forwarded-For** : Header contenant la chaîne d'IPs (client, proxy1, proxy2, ...)
3. **X-Real-IP** : Header alternatif contenant l'IP du client (si X-Forwarded-For n'est pas disponible)
4. **Normalisation** : Conversion des adresses IPv6 mappées (`::ffff:192.168.1.1` → `192.168.1.1`)

## Configuration

### Variable d'environnement

```bash
# Activer trust proxy (recommandé en production avec reverse proxy)
TRUST_PROXY=true

# Désactiver trust proxy (pour développement local ou API directe)
TRUST_PROXY=false
```

### Configuration en production

#### Kubernetes / Ingress NGINX

Si vous utilisez Kubernetes avec Ingress NGINX, l'Ingress ajoute automatiquement les headers `X-Forwarded-For` et `X-Real-IP`. Configurez simplement :

```yaml
# deployment.yaml
env:
  - name: TRUST_PROXY
    value: "true"
```

#### LoadBalancer Cloud (AWS ALB, GCP LB, Azure LB)

Ces load balancers ajoutent automatiquement les headers de forwarding. Activez simplement `TRUST_PROXY=true`.

#### NGINX Reverse Proxy

Si vous utilisez NGINX comme reverse proxy, assurez-vous que la configuration inclut :

```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

Puis configurez `TRUST_PROXY=true` dans l'application.

### Configuration en développement

Pour le développement local sans reverse proxy :

```bash
TRUST_PROXY=false
```

L'application utilisera directement `req.ip` ou `req.connection.remoteAddress`.

## Utilisation dans le code

### Service centralisé : `IpDetectionService`

Tous les controllers utilisent `IpDetectionService.getClientIp(req)` au lieu de lire directement `req.ip` :

```typescript
import { IpDetectionService } from '../common/services/ip-detection.service';

constructor(
  private readonly ipDetectionService: IpDetectionService,
) {}

@Post('endpoint')
async myEndpoint(@Req() req: any) {
  const clientIp = this.ipDetectionService.getClientIp(req);
  // Utiliser clientIp pour logging, rate limiting, etc.
}
```

### Fonction utilitaire : `getClientIp()`

Pour un usage direct (sans injection de dépendance) :

```typescript
import { getClientIp } from '../common/utils/ip-utils';
import { ConfigService } from '@nestjs/config';

const trustProxy = configService.get<string>('TRUST_PROXY') === 'true';
const clientIp = getClientIp(req, trustProxy);
```

## Priorité de détection

Lorsque `TRUST_PROXY=true`, l'ordre de priorité est :

1. **X-Forwarded-For** (première IP dans la chaîne)
2. **X-Real-IP** (si X-Forwarded-For n'est pas disponible)
3. **req.ip** (set par Express quand trust proxy est activé)
4. **req.connection.remoteAddress** (fallback)
5. **req.socket.remoteAddress** (fallback)
6. **"unknown"** (si aucune IP n'est trouvée)

Lorsque `TRUST_PROXY=false`, les headers de proxy sont ignorés et on utilise directement `req.ip` ou les fallbacks.

## Normalisation IPv6

L'application normalise automatiquement les adresses IPv6 mappées :

- `::ffff:192.168.1.1` → `192.168.1.1`
- `[2001:0db8::1]` → `2001:0db8::1`

## Endpoints concernés

Tous les endpoints qui utilisent l'IP client pour :
- **Rate limiting** : `PublicEndpointSecurityService`
- **Audit logs** : Tous les controllers (auth, leads, forms, scheduling, users, settings, calendar-config)
- **Brute force protection** : `BruteForceService`
- **Logging** : Tous les endpoints publics

## Sécurité

### Risques si TRUST_PROXY mal configuré

⚠️ **Si `TRUST_PROXY=true` sans reverse proxy** :
- Les clients peuvent forger `X-Forwarded-For` et contourner le rate limiting
- Les logs peuvent contenir des IPs falsifiées

✅ **Recommandation** :
- `TRUST_PROXY=true` uniquement si vous avez un reverse proxy qui filtre/valide les headers
- En production, utilisez un reverse proxy qui supprime les headers `X-Forwarded-For` non fiables

### Protection contre la falsification

Si votre reverse proxy ne filtre pas les headers, vous pouvez ajouter un middleware pour valider que `X-Forwarded-For` provient bien du proxy (basé sur l'IP source du proxy). Cependant, la configuration standard avec Ingress NGINX / LoadBalancer cloud gère cela automatiquement.

## Tests

Les tests unitaires couvrent :
- Détection avec `X-Forwarded-For`
- Fallback sans header
- Normalisation IPv6
- Gestion des chaînes d'IPs multiples
- Comportement avec/sans trust proxy

Exécuter les tests :

```bash
cd apps/api
pnpm test ip-utils.spec
```

## Dépannage

### L'IP détectée est celle du proxy

**Symptôme** : Les logs montrent toujours la même IP (celle du proxy)

**Solution** :
1. Vérifier que `TRUST_PROXY=true` est configuré
2. Vérifier que le reverse proxy ajoute `X-Forwarded-For`
3. Vérifier les logs au démarrage : `✅ Trust proxy enabled`

### L'IP détectée est "unknown"

**Symptôme** : Les logs montrent `ip: "unknown"`

**Solution** :
1. Vérifier que `req.ip` ou `req.connection.remoteAddress` est disponible
2. Vérifier la configuration du reverse proxy
3. Vérifier les logs d'erreur

### Rate limiting ne fonctionne pas correctement

**Symptôme** : Le rate limiting bloque tous les utilisateurs ou ne bloque personne

**Solution** :
1. Vérifier que `TRUST_PROXY` correspond à votre environnement
2. Vérifier que `PublicEndpointSecurityService` utilise `IpDetectionService`
3. Vérifier les logs pour voir quelle IP est détectée

## Migration

Si vous migrez d'une configuration sans reverse proxy vers une avec reverse proxy :

1. **Avant** : `TRUST_PROXY=false` (ou non défini)
2. **Déployer le reverse proxy** avec configuration des headers
3. **Après** : `TRUST_PROXY=true`
4. **Vérifier** : Les logs doivent maintenant montrer les IPs clients réelles

## Références

- [Express Trust Proxy](https://expressjs.com/en/guide/behind-proxies.html)
- [X-Forwarded-For Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)
- [NGINX Proxy Headers](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_set_header)
