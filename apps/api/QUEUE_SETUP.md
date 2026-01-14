# Configuration de la Queue (BullMQ + Redis)

## Vue d'ensemble

L'application utilise BullMQ avec Redis pour gérer les jobs en arrière-plan (notifications, emails, SMS, etc.).

## Configuration

### Variables d'environnement

Ajoutez ces variables dans `apps/api/.env` :

```env
# Activer/désactiver la queue (par défaut: false)
QUEUE_ENABLED=true

# Configuration Redis
# Option 1: URL complète
REDIS_URL=redis://localhost:6379

# Option 2: Host/Port séparés
REDIS_HOST=localhost
REDIS_PORT=6379

# TLS (optionnel, pour production)
REDIS_TLS=false
```

### Désactiver la queue

Si `QUEUE_ENABLED=false` ou si Redis n'est pas disponible, les jobs seront exécutés de manière synchrone (comportement de fallback).

## Installation Redis locale (Docker)

Pour démarrer Redis localement avec Docker :

```bash
docker run -d \
  --name redis-klozd \
  -p 6379:6379 \
  redis:7-alpine
```

Ou avec docker-compose :

```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

## Vérification

1. Vérifiez que Redis est accessible :
```bash
redis-cli ping
# Devrait répondre: PONG
```

2. Vérifiez les logs de l'API au démarrage :
```
✅ Queue activée avec Redis (localhost:6379)
✅ Worker de notifications démarré
```

## Types de jobs

- `SEND_EMAIL` : Envoi d'emails (vérification, invitations, confirmations, etc.)
- `SEND_SMS` : Envoi de SMS (rappels de RDV)
- `SEND_WHATSAPP` : Envoi de messages WhatsApp
- `CREATE_INAPP_NOTIFICATION` : Création de notifications in-app

## Dead Letter Queue (DLQ)

Les jobs qui échouent définitivement (après 5 tentatives) sont enregistrés dans la table `failed_jobs` de la base de données.

Pour consulter les jobs échoués, utilisez le service `FailedJobService` ou interrogez directement la table.

## Production

En production, utilisez un service Redis géré (AWS ElastiCache, Redis Cloud, etc.) et configurez `REDIS_TLS=true` si nécessaire.
