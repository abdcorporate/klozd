# Variables d'environnement - API

## Configuration requise

Copiez ce fichier vers `.env` et remplissez les valeurs.

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
DISABLE_CRONS_ON_REDIS_DOWN=false

# Email (Resend)
RESEND_API_KEY=re_xxxxx

# Data Retention
RETENTION_FORM_ABANDON_DAYS=90
RETENTION_NOTIFICATION_DAYS=180
RETENTION_AUDIT_LOG_DAYS=365
```

Voir `docs/ops/domains.md` pour la configuration complète des domaines.
