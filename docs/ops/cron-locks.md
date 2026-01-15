# Verrous distribués pour les cron jobs

## Pourquoi c'est nécessaire ?

En environnement de scaling horizontal (plusieurs réplicas de l'application), chaque instance exécute les mêmes cron jobs. Sans mécanisme de verrouillage distribué, cela peut entraîner :

- **Exécutions en double** : Le même job s'exécute simultanément sur plusieurs instances
- **Ressources gaspillées** : Traitement redondant des mêmes données
- **Risques de corruption** : Conflits lors de modifications concurrentes
- **Notifications dupliquées** : Les utilisateurs reçoivent plusieurs fois le même email/SMS

Le `DistributedLockService` utilise **Redis** pour garantir qu'un seul cron job s'exécute à la fois, même avec plusieurs réplicas.

## Architecture

### Préfixe des clés

Tous les verrous utilisent le préfixe `locks:klozd:` suivi du nom du job :

```
locks:klozd:handleAppointmentConfirmations
locks:klozd:handleDayBeforeReminders
locks:klozd:handleDataRetention
```

### Mécanisme de verrouillage

Le service utilise la commande Redis `SET key value NX PX ttl` :

- **NX** : Set only if the key does not exist (atomic operation)
- **PX** : Expiration en millisecondes
- **TTL** : Time To Live configuré par job (2-30 min selon la complexité)

### Jobs protégés

Tous les cron jobs suivants sont protégés par des verrous distribués :

#### SchedulingTasksService
- `handleAppointmentConfirmations` (TTL: 5 min)
- `handleDayBeforeReminders` (TTL: 5 min)
- `handleHourBeforeReminders` (TTL: 3 min)
- `handleAppointmentStartNotifications` (TTL: 3 min)
- `handleNoShowDetection` (TTL: 3 min)
- `handleNoShowRecoveryEmails` (TTL: 5 min)
- `handleNoShowRateNotification` (TTL: 10 min)

#### LeadsTasksService
- `handleAbandonRecovery` (TTL: 5 min)

#### DataRetentionTasksService
- `handleDataRetention` (TTL: 30 min)

### Justification des TTL

Les TTL sont choisis pour être supérieurs au worst-case runtime de chaque job :

- **3 min** : Jobs rapides exécutés fréquemment (toutes les 15 min)
- **5 min** : Jobs de traitement par batch (toutes les heures)
- **10 min** : Jobs plus longs traitant plusieurs organisations
- **30 min** : Job de purge de données (peut traiter de grandes quantités)

## Configuration

### Variables d'environnement

```bash
# Activer/désactiver Redis (par défaut: activé)
REDIS_ENABLED=true

# URL Redis (optionnel, sinon utilise REDIS_HOST/REDIS_PORT)
REDIS_URL=redis://localhost:6379

# Host Redis (si REDIS_URL non défini)
REDIS_HOST=localhost

# Port Redis (si REDIS_URL non défini)
REDIS_PORT=6379

# TLS pour Redis (optionnel)
REDIS_TLS=false

# Comportement si Redis est indisponible
# true = ne pas exécuter les crons (fail-closed, recommandé en production multi-instances)
# false = exécuter quand même (single-instance, pour dev/local)
DISABLE_CRONS_ON_REDIS_DOWN=true
```

### Comportement si Redis est indisponible

#### Mode `DISABLE_CRONS_ON_REDIS_DOWN=true` (fail-closed)

- ✅ **Recommandé en production** avec plusieurs réplicas
- Les crons ne s'exécutent **pas** si Redis est down
- Évite les exécutions en double
- Logs : `⚠️ Redis indisponible, cron "X" désactivé (fallback=disable)`

#### Mode `DISABLE_CRONS_ON_REDIS_DOWN=false` (single-instance)

- ✅ **Recommandé en développement** ou instance unique
- Les crons s'exécutent même si Redis est down
- ⚠️ **Risque d'exécutions en double** si plusieurs instances
- Logs : `⚠️ Redis indisponible, cron "X" exécuté en mode single-instance (risque de doublons)`

## Monitoring

### Logs Pino

Tous les événements de verrouillage sont loggés avec Pino :

```json
{
  "level": 30,
  "time": 1234567890,
  "lockKey": "locks:klozd:handleAppointmentConfirmations",
  "acquired": true,
  "ttlMs": 300000,
  "durationMs": 45,
  "msg": "Lock acquired and function executed for \"handleAppointmentConfirmations\""
}
```

### Métriques à surveiller

1. **Taux d'acquisition de lock** : `acquired: true` vs `acquired: false`
2. **Durée d'exécution** : `durationMs` pour détecter les jobs lents
3. **Erreurs Redis** : Logs avec `reason: 'redis_error'` ou `reason: 'redis_unavailable'`
4. **Fallback mode** : Vérifier que `fallbackMode` correspond à l'environnement

### Exemples de logs

#### Lock acquis avec succès
```
{"level":30,"lockKey":"locks:klozd:handleAppointmentConfirmations","acquired":true,"ttlMs":300000,"durationMs":1234}
```

#### Lock refusé (déjà acquis par une autre instance)
```
{"level":30,"lockKey":"locks:klozd:handleAppointmentConfirmations","acquired":false,"ttlMs":300000,"durationMs":5}
```

#### Redis indisponible (mode fail-closed)
```
{"level":40,"lockKey":"locks:klozd:handleAppointmentConfirmations","acquired":false,"reason":"redis_unavailable","fallbackMode":"disable"}
```

#### Redis indisponible (mode single-instance)
```
{"level":40,"lockKey":"locks:klozd:handleAppointmentConfirmations","acquired":true,"reason":"redis_unavailable","fallbackMode":"single-instance"}
```

## Utilisation dans le code

### Pattern recommandé : `withLock()`

```typescript
@Cron(CronExpression.EVERY_HOUR)
async handleMyJob() {
  await this.lockService.withLock('handleMyJob', 5 * 60 * 1000, async () => {
    // Code du job ici
    // Le lock est automatiquement libéré à la fin (succès ou erreur)
  });
}
```

### Pattern legacy : `acquire()` + `release()`

```typescript
@Cron(CronExpression.EVERY_HOUR)
async handleMyJob() {
  const acquired = await this.lockService.acquire('handleMyJob', 5 * 60 * 1000);
  
  if (!acquired) {
    return; // Déjà en cours d'exécution sur une autre instance
  }

  try {
    // Code du job ici
  } finally {
    await this.lockService.release('handleMyJob');
  }
}
```

## Dépannage

### Les crons ne s'exécutent pas

1. Vérifier que Redis est accessible : `redis-cli ping`
2. Vérifier `REDIS_ENABLED=true`
3. Vérifier les logs pour `redis_unavailable` ou `redis_error`
4. Si `DISABLE_CRONS_ON_REDIS_DOWN=true`, les crons ne s'exécutent pas si Redis est down

### Exécutions en double détectées

1. Vérifier que `DISABLE_CRONS_ON_REDIS_DOWN=true` en production
2. Vérifier que Redis est accessible depuis toutes les instances
3. Vérifier les logs pour confirmer que les locks sont acquis
4. Vérifier que le TTL est suffisant (job qui prend plus de temps que prévu)

### Lock jamais libéré

1. Le TTL libère automatiquement le lock après expiration
2. Vérifier que le TTL est suffisant pour le worst-case runtime
3. Vérifier les logs pour détecter les jobs qui crashent avant de libérer le lock

## Tests

Les tests unitaires sont disponibles dans `distributed-lock.service.spec.ts` :

```bash
cd apps/api
pnpm test distributed-lock.service.spec
```

Les tests couvrent :
- Acquisition de lock (première fois vs déjà acquis)
- Respect du TTL
- Comportement en cas de Redis indisponible
- Exécution de fonction avec `withLock()`
- Libération de lock
