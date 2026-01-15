# 📦 Stratégie de Backup Postgres

## 📋 Vue d'ensemble

Ce document décrit la stratégie de backup et de restauration pour la base de données PostgreSQL utilisée par l'application Klozd. Même si l'infrastructure de backup est gérée par un service externe (ex: AWS RDS, Google Cloud SQL, ou un service de backup dédié), il est important de comprendre les responsabilités, les procédures et les bonnes pratiques.

## 🎯 Objectifs

- **Récupération de données** : Pouvoir restaurer la base de données à un point dans le temps
- **Conformité** : Respecter les exigences légales de rétention des données
- **Disaster Recovery** : Minimiser le RTO (Recovery Time Objective) et RPO (Recovery Point Objective)
- **Tests de restauration** : Valider régulièrement que les backups sont fonctionnels

## 🔄 Types de Backups

### 1. Backups Logiques (Logical Backups)

**Description** : Export SQL des données et du schéma via `pg_dump` ou `pg_dumpall`.

**Avantages** :
- Portable entre différentes versions de PostgreSQL
- Permet la restauration sélective (tables, schémas)
- Facile à compresser et stocker
- Permet la migration entre serveurs

**Inconvénients** :
- Plus lent pour les grandes bases de données
- Nécessite un accès exclusif pendant le dump complet
- Peut être plus volumineux que les backups physiques

**Utilisation recommandée** :
- Backups quotidiens pour les bases de données < 100GB
- Backups hebdomadaires pour les bases de données plus grandes
- Backups avant migrations majeures

### 2. Backups Physiques (Physical Backups)

**Description** : Copie binaire des fichiers de données PostgreSQL (WAL archiving, `pg_basebackup`).

**Avantages** :
- Plus rapide pour les grandes bases de données
- Permet la restauration point-in-time (PITR)
- Moins d'impact sur les performances

**Inconvénients** :
- Spécifique à la version de PostgreSQL
- Nécessite une configuration WAL archiving
- Plus complexe à restaurer

**Utilisation recommandée** :
- Backups continus avec WAL archiving
- Bases de données de production critiques
- RPO très court requis (< 1 heure)

## 📅 Fréquence Recommandée

### Production

| Type de Backup | Fréquence | Rétention | RPO | RTO |
|----------------|-----------|-----------|-----|-----|
| **Backup complet logique** | Quotidien (2h du matin) | 30 jours | 24h | 2-4h |
| **Backup incrémental logique** | Toutes les 6 heures | 7 jours | 6h | 1-2h |
| **WAL archiving** (si configuré) | Continu | 7 jours | < 1h | < 1h |
| **Backup avant migration** | Avant chaque migration | 90 jours | - | - |

### Staging/Development

| Type de Backup | Fréquence | Rétention | RPO | RTO |
|----------------|-----------|-----------|-----|-----|
| **Backup complet logique** | Hebdomadaire | 14 jours | 7 jours | 4-8h |
| **Backup avant déploiement** | Avant chaque déploiement majeur | 30 jours | - | - |

## 🛠️ Procédures de Backup

### Backup Logique avec pg_dump

```bash
# Backup complet de la base de données
pg_dump -h <host> -U <user> -d <database> \
  --format=custom \
  --compress=9 \
  --file=backup_$(date +%Y%m%d_%H%M%S).dump

# Backup avec exclusion de certaines tables (ex: logs temporaires)
pg_dump -h <host> -U <user> -d <database> \
  --format=custom \
  --compress=9 \
  --exclude-table=audit_logs \
  --exclude-table=form_abandons \
  --file=backup_$(date +%Y%m%d_%H%M%S).dump

# Backup d'un schéma spécifique
pg_dump -h <host> -U <user> -d <database> \
  --schema=public \
  --format=custom \
  --compress=9 \
  --file=backup_schema_$(date +%Y%m%d_%H%M%S).dump
```

### Backup avec pg_dumpall (toutes les bases)

```bash
# Backup de toutes les bases de données et rôles
pg_dumpall -h <host> -U <user> \
  --format=custom \
  --compress=9 \
  --file=backup_all_$(date +%Y%m%d_%H%M%S).dump
```

### Script de Backup Automatisé

```bash
#!/bin/bash
# backup-postgres.sh

set -e

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_HOST="${DB_HOST:-localhost}"
DB_NAME="${DB_NAME:-klozd}"
DB_USER="${DB_USER:-postgres}"

# Créer le répertoire de backup s'il n'existe pas
mkdir -p "$BACKUP_DIR"

# Backup complet
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_DIR/backup_${DATE}.dump"

# Compresser avec gzip (double compression pour économiser l'espace)
gzip "$BACKUP_DIR/backup_${DATE}.dump"

# Supprimer les backups plus anciens que 30 jours
find "$BACKUP_DIR" -name "backup_*.dump.gz" -mtime +30 -delete

echo "Backup completed: backup_${DATE}.dump.gz"
```

## 🔄 Procédures de Restauration

### Restauration Complète

```bash
# Restaurer depuis un backup custom
pg_restore -h <host> -U <user> -d <database> \
  --clean \
  --if-exists \
  --verbose \
  backup_20240127_020000.dump

# Restaurer depuis un backup SQL
psql -h <host> -U <user> -d <database> < backup_20240127_020000.sql
```

### Restauration Sélective (Table/Schéma)

```bash
# Restaurer une table spécifique
pg_restore -h <host> -U <user> -d <database> \
  --table=users \
  --table=organizations \
  backup_20240127_020000.dump

# Restaurer un schéma spécifique
pg_restore -h <host> -U <user> -d <database> \
  --schema=public \
  backup_20240127_020000.dump
```

### Restauration Point-in-Time (PITR)

Si WAL archiving est configuré :

```bash
# 1. Restaurer le backup de base
pg_basebackup -h <host> -U <user> -D /path/to/restore

# 2. Créer recovery.conf
cat > /path/to/restore/recovery.conf << EOF
restore_command = 'cp /path/to/wal/%f %p'
recovery_target_time = '2024-01-27 14:30:00'
EOF

# 3. Démarrer PostgreSQL
postgres -D /path/to/restore
```

## ✅ Tests de Restauration

### Fréquence Recommandée

- **Production** : Mensuel (le premier samedi du mois)
- **Staging** : Trimestriel
- **Après chaque changement majeur** : Immédiatement après le changement

### Procédure de Test

1. **Préparer un environnement de test** :
   ```bash
   # Créer une base de données de test
   createdb -h <host> -U <user> klozd_restore_test
   ```

2. **Restaurer le backup le plus récent** :
   ```bash
   pg_restore -h <host> -U <user> -d klozd_restore_test \
     --clean \
     --if-exists \
     backup_20240127_020000.dump
   ```

3. **Vérifier l'intégrité** :
   ```sql
   -- Vérifier le nombre d'enregistrements
   SELECT 
     schemaname,
     tablename,
     n_live_tup as row_count
   FROM pg_stat_user_tables
   ORDER BY schemaname, tablename;

   -- Vérifier les contraintes
   SELECT conname, contype, conrelid::regclass
   FROM pg_constraint
   WHERE contype IN ('p', 'f', 'u', 'c');

   -- Vérifier les index
   SELECT 
     schemaname,
     tablename,
     indexname
   FROM pg_indexes
   WHERE schemaname = 'public';
   ```

4. **Tests fonctionnels** :
   - Vérifier que l'application peut se connecter
   - Tester quelques requêtes critiques
   - Vérifier les relations entre tables

5. **Documenter les résultats** :
   - Date du test
   - Backup testé
   - Durée de la restauration
   - Problèmes rencontrés (le cas échéant)
   - Actions correctives

## 🔐 Sécurité des Backups

### Stockage

- **Chiffrement** : Tous les backups doivent être chiffrés (AES-256)
- **Accès** : Limiter l'accès aux backups aux personnes autorisées uniquement
- **Stockage externe** : Stocker les backups dans un emplacement séparé (cloud, serveur distant)
- **Rotation** : Implémenter une rotation automatique des backups

### Exemple de Chiffrement

```bash
# Chiffrer le backup avec GPG
pg_dump -h <host> -U <user> -d <database> \
  --format=custom \
  --compress=9 \
  | gpg --encrypt --recipient backup@klozd.com \
  > backup_$(date +%Y%m%d_%H%M%S).dump.gpg

# Déchiffrer pour restauration
gpg --decrypt backup_20240127_020000.dump.gpg \
  | pg_restore -h <host> -U <user> -d <database>
```

## 📊 Monitoring et Alertes

### Métriques à Surveiller

- **Taille des backups** : Détecter les anomalies (croissance soudaine)
- **Durée des backups** : Alerter si > 2h pour un backup quotidien
- **Espace disque** : Alerter si < 20% d'espace libre
- **Échecs de backup** : Alerter immédiatement en cas d'échec

### Exemple de Script de Monitoring

```bash
#!/bin/bash
# check-backup-health.sh

BACKUP_DIR="/backups/postgres"
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/*.dump.gz 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
  echo "ERROR: No backup found"
  exit 1
fi

BACKUP_AGE=$(($(date +%s) - $(stat -c %Y "$LATEST_BACKUP")))
MAX_AGE=$((25 * 60 * 60)) # 25 heures

if [ $BACKUP_AGE -gt $MAX_AGE ]; then
  echo "ERROR: Latest backup is older than 25 hours"
  exit 1
fi

BACKUP_SIZE=$(stat -c %s "$LATEST_BACKUP")
MIN_SIZE=$((100 * 1024 * 1024)) # 100 MB

if [ $BACKUP_SIZE -lt $MIN_SIZE ]; then
  echo "WARNING: Backup size is suspiciously small"
  exit 1
fi

echo "OK: Backup health check passed"
```

## 🏗️ Responsabilités

### Équipe DevOps/Infrastructure

- Configuration et maintenance de l'infrastructure de backup
- Monitoring des backups automatisés
- Gestion du stockage des backups
- Tests de restauration mensuels
- Documentation des procédures

### Équipe Développement

- S'assurer que les migrations de schéma sont compatibles avec les backups
- Tester les restaurations après migrations majeures
- Documenter les changements de schéma critiques
- Participer aux tests de restauration

### Équipe Sécurité

- Vérifier le chiffrement des backups
- Auditer l'accès aux backups
- Valider la conformité avec les exigences légales

## 📝 Checklist de Backup

### Quotidien

- [ ] Vérifier que le backup quotidien s'est exécuté avec succès
- [ ] Vérifier la taille du backup (détecter les anomalies)
- [ ] Vérifier l'espace disque disponible

### Hebdomadaire

- [ ] Vérifier la rétention des backups (supprimer les anciens)
- [ ] Vérifier l'intégrité du backup le plus récent (pg_restore --list)

### Mensuel

- [ ] Effectuer un test de restauration complet
- [ ] Documenter les résultats du test
- [ ] Vérifier la conformité avec les politiques de rétention

### Avant Migration Majeure

- [ ] Créer un backup complet
- [ ] Tester la restauration du backup
- [ ] Documenter le point de restauration

## 🔗 Ressources

- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- [pg_restore Documentation](https://www.postgresql.org/docs/current/app-pgrestore.html)
- [Point-in-Time Recovery](https://www.postgresql.org/docs/current/continuous-archiving.html)

## 📞 Contacts

En cas de problème avec les backups ou besoin de restauration :

- **DevOps** : devops@klozd.com
- **On-call** : Voir le calendrier PagerDuty
- **Urgence** : Escalader via le canal Slack #incidents

---

**Dernière mise à jour** : 2025-01-27  
**Prochaine révision** : 2025-04-27
