# 📋 PATCH COMPLET : STRATÉGIE DE RÉTENTION DE DONNÉES

## 📋 RÉSUMÉ

Ce patch implémente une stratégie minimale de rétention de données côté application avec :
- **Service de rétention** : `DataRetentionService` avec méthodes de purge pour FormAbandon, Notifications, IdempotencyKey, AuditLog
- **Job cron quotidien** : Exécution automatique à 2h du matin avec verrouillage distribué
- **Configuration env** : Variables `RETENTION_*` pour personnaliser les périodes de rétention
- **Logs détaillés** : Comptage et logging de toutes les suppressions
- **Tests unitaires** : Tests complets avec mocks Prisma
- **Documentation** : Fichier `docs/ops/backup.md` avec stratégie de backup Postgres

## 🎯 BACKEND (apps/api)

### **1. Service de Rétention : `DataRetentionService`**

**Fichier** : `apps/api/src/common/services/data-retention.service.ts`

**Méthodes principales** :
- `purgeFormAbandons()` : Purge les FormAbandon > 90 jours (configurable)
- `purgeNotifications()` : Purge les Notifications lues > 180 jours (configurable)
- `purgeIdempotencyKeys()` : Purge les IdempotencyKey expirées
- `purgeAuditLogs()` : Purge les AuditLog > 365 jours (configurable)
- `runAllPurges()` : Exécute toutes les purges en parallèle et retourne les statistiques

**Configuration** :
- `RETENTION_FORM_ABANDON_DAYS` : 90 jours par défaut
- `RETENTION_NOTIFICATION_DAYS` : 180 jours par défaut
- `RETENTION_AUDIT_LOG_DAYS` : 365 jours par défaut

**Logs** :
- Log du nombre d'enregistrements purgés pour chaque type
- Log des statistiques agrégées après exécution complète
- Gestion d'erreurs avec logging détaillé

### **2. Service de Tâches Cron : `DataRetentionTasksService`**

**Fichier** : `apps/api/src/common/services/data-retention-tasks.service.ts`

**Fonctionnalités** :
- **Cron job quotidien** : Exécution à 2h du matin (`@Cron('0 2 * * *')`)
- **Verrouillage distribué** : Utilise `DistributedLockService` pour éviter les exécutions simultanées
- **Logging structuré** : Utilise PinoLogger pour les métriques
- **Gestion d'erreurs** : Logs détaillés en cas d'échec

### **3. Module : `CommonModule`**

**Modifications** :
- Ajout de `ScheduleModule.forRoot()` pour activer les cron jobs
- Ajout de `DataRetentionService` et `DataRetentionTasksService` dans les providers
- Export de `DataRetentionService` pour utilisation dans d'autres modules

### **4. Tests Unitaires**

**Fichier** : `apps/api/src/common/services/data-retention.service.spec.ts`

**Couverture** :
- ✅ Test de `purgeFormAbandons()` avec vérification de la date de coupure
- ✅ Test de `purgeNotifications()` avec vérification du statut READ
- ✅ Test de `purgeIdempotencyKeys()` avec vérification de l'expiration
- ✅ Test de `purgeAuditLogs()` avec vérification de la date de coupure
- ✅ Test de `runAllPurges()` avec agrégation des statistiques
- ✅ Test de gestion d'erreurs
- ✅ Test de configuration personnalisée via variables d'environnement

**Mocks** :
- Mock complet de `PrismaService` avec toutes les méthodes nécessaires
- Mock de `ConfigService` pour tester différentes configurations

## 📝 DOCUMENTATION

### **Fichier : `docs/ops/backup.md`**

**Contenu** :
1. **Vue d'ensemble** : Objectifs et responsabilités
2. **Types de Backups** :
   - Backups logiques (pg_dump)
   - Backups physiques (WAL archiving)
3. **Fréquence Recommandée** :
   - Production : Backups quotidiens, incrémentaux toutes les 6h
   - Staging/Dev : Backups hebdomadaires
4. **Procédures de Backup** :
   - Scripts pg_dump avec exemples
   - Script de backup automatisé
5. **Procédures de Restauration** :
   - Restauration complète
   - Restauration sélective (table/schéma)
   - Restauration point-in-time (PITR)
6. **Tests de Restauration** :
   - Fréquence recommandée (mensuel pour prod)
   - Procédure complète avec vérifications
7. **Sécurité** :
   - Chiffrement des backups
   - Stockage sécurisé
8. **Monitoring** :
   - Métriques à surveiller
   - Script de monitoring de santé
9. **Responsabilités** :
   - DevOps/Infrastructure
   - Développement
   - Sécurité
10. **Checklist** : Quotidien, hebdomadaire, mensuel

## 🔧 CONFIGURATION

### **Variables d'Environnement**

Ajouter dans `.env` :

```bash
# Rétention de données (en jours)
RETENTION_FORM_ABANDON_DAYS=90      # FormAbandon > 90 jours
RETENTION_NOTIFICATION_DAYS=180     # Notifications lues > 180 jours
RETENTION_AUDIT_LOG_DAYS=365        # AuditLog > 365 jours
```

### **Exemple de Configuration Personnalisée**

```bash
# Pour un environnement avec plus de rétention
RETENTION_FORM_ABANDON_DAYS=180
RETENTION_NOTIFICATION_DAYS=365
RETENTION_AUDIT_LOG_DAYS=730  # 2 ans
```

## 📁 FICHIERS CRÉÉS/MODIFIÉS

### **Backend**

1. **Nouveau** : `apps/api/src/common/services/data-retention.service.ts`
   - Service principal de rétention de données

2. **Nouveau** : `apps/api/src/common/services/data-retention-tasks.service.ts`
   - Service de tâches cron pour exécution automatique

3. **Nouveau** : `apps/api/src/common/services/data-retention.service.spec.ts`
   - Tests unitaires complets

4. **Modifié** : `apps/api/src/common/common.module.ts`
   - Ajout de `ScheduleModule`, `DataRetentionService`, `DataRetentionTasksService`

5. **Nouveau** : `docs/ops/backup.md`
   - Documentation complète de la stratégie de backup Postgres

## 🧪 TESTS

### **Exécution des Tests**

```bash
cd apps/api
pnpm test data-retention.service.spec
```

### **Exemple de Sortie**

```
PASS  src/common/services/data-retention.service.spec.ts
  DataRetentionService
    purgeFormAbandons
      ✓ should purge FormAbandon records older than 90 days
      ✓ should return 0 when no records to purge
    purgeNotifications
      ✓ should purge read Notification records older than 180 days
      ✓ should return 0 when no records to purge
    purgeIdempotencyKeys
      ✓ should purge expired IdempotencyKey records
      ✓ should return 0 when no records to purge
    purgeAuditLogs
      ✓ should purge AuditLog records older than 365 days
      ✓ should return 0 when no records to purge
    runAllPurges
      ✓ should run all purge methods and return aggregated stats
      ✓ should handle errors gracefully
      ✓ should use custom retention days from environment
```

## 🚀 DÉPLOIEMENT

### **1. Ajouter les Variables d'Environnement**

```bash
# Production
RETENTION_FORM_ABANDON_DAYS=90
RETENTION_NOTIFICATION_DAYS=180
RETENTION_AUDIT_LOG_DAYS=365
```

### **2. Vérifier le Cron Job**

Le cron job s'exécute automatiquement à 2h du matin. Vérifier les logs :

```bash
# Vérifier que le job s'est exécuté
grep "Data retention purge" logs/app.log

# Vérifier les statistiques
grep "Data retention purge completed" logs/app.log
```

### **3. Monitoring**

Surveiller les métriques suivantes :
- Nombre d'enregistrements purgés par type
- Durée d'exécution du job
- Erreurs éventuelles

## 📊 STATISTIQUES DE PURGE

### **Format des Logs**

```
[DataRetentionService] Purged 5 FormAbandon records older than 90 days
[DataRetentionService] Purged 10 read Notification records older than 180 days
[DataRetentionService] Purged 15 expired IdempotencyKey records
[DataRetentionService] Purged 20 AuditLog records older than 365 days
[DataRetentionService] Data retention purge completed in 1234ms. Stats: {"formAbandons":5,"notifications":10,"idempotencyKeys":15,"auditLogs":20,"total":50}
```

### **Métriques PinoLogger**

```json
{
  "jobName": "handleDataRetention",
  "acquired": true,
  "durationMs": 1234,
  "stats": {
    "formAbandons": 5,
    "notifications": 10,
    "idempotencyKeys": 15,
    "auditLogs": 20,
    "total": 50
  }
}
```

## ⚠️ POINTS D'ATTENTION

### **1. Performance**

- Les purges s'exécutent en parallèle pour optimiser les performances
- Utilisation de `deleteMany` pour des suppressions efficaces
- Le job s'exécute à 2h du matin pour minimiser l'impact sur les utilisateurs

### **2. Sécurité**

- Les données sensibles sont déjà sanitizées dans les audit logs
- Les suppressions sont irréversibles (pas de soft delete)
- Vérifier les backups avant d'augmenter l'agressivité des purges

### **3. Conformité**

- Vérifier les exigences légales de rétention des données
- Adapter les périodes de rétention selon les besoins
- Documenter les politiques de rétention

### **4. Verrouillage Distribué**

- Le job utilise `DistributedLockService` pour éviter les exécutions simultanées
- En cas d'absence de Redis, le lock est désactivé (mode single-instance)
- Le TTL du lock est de 30 minutes

## ✅ VALIDATION

- [x] Service `DataRetentionService` créé
- [x] Service `DataRetentionTasksService` créé avec cron job
- [x] Configuration env (RETENTION_*) implémentée
- [x] Logs des suppressions (count) implémentés
- [x] Tests unitaires avec mocks Prisma créés
- [x] Module `CommonModule` mis à jour
- [x] Documentation `docs/ops/backup.md` créée
- [ ] Variables d'environnement à ajouter dans les fichiers .env

## 🔄 PROCHAINES ÉTAPES

1. **Ajouter les variables d'environnement** dans les fichiers `.env` :
   ```bash
   RETENTION_FORM_ABANDON_DAYS=90
   RETENTION_NOTIFICATION_DAYS=180
   RETENTION_AUDIT_LOG_DAYS=365
   ```

2. **Tester le service** :
   ```bash
   cd apps/api
   pnpm test data-retention.service.spec
   ```

3. **Vérifier le cron job** :
   - Attendre 2h du matin ou exécuter manuellement
   - Vérifier les logs pour confirmer l'exécution

4. **Monitoring** :
   - Surveiller les métriques de purge
   - Vérifier l'espace disque libéré
   - Ajuster les périodes de rétention si nécessaire

## 📚 RESSOURCES

- [NestJS Schedule Module](https://docs.nestjs.com/techniques/task-scheduling)
- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [Prisma deleteMany](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#deletemany)

---

**Date** : 2025-01-27  
**Auteur** : Implémentation stratégie de rétention de données  
**Version** : 1.0.0
