# 📧 Configuration de l'envoi d'emails - KLOZD

Pour que la vérification par email fonctionne, vous devez configurer un service d'email.

## 🎯 Option 1 : Resend (Recommandé - Plus simple)

### Étapes :

1. **Créer un compte sur Resend**
   - Allez sur https://resend.com
   - Créez un compte gratuit (100 emails/jour gratuits)
   - Vérifiez votre email

2. **Obtenir une clé API**
   - Dans le dashboard Resend, allez dans "API Keys"
   - Cliquez sur "Create API Key"
   - Donnez un nom (ex: "KLOZD Production")
   - Copiez la clé API (commence par `re_...`)

3. **Configurer dans votre projet**
   - Ouvrez le fichier `.env` dans `apps/api/.env`
   - Ajoutez :
     ```env
     RESEND_API_KEY=re_votre_cle_api_ici
     EMAIL_FROM=noreply@votre-domaine.com
     FRONTEND_URL=http://localhost:3000
     ```

4. **Vérifier le domaine (optionnel mais recommandé)**
   - Dans Resend, allez dans "Domains"
   - Ajoutez votre domaine (ex: `klozd.app`)
   - Suivez les instructions pour configurer les DNS
   - Une fois vérifié, vous pouvez utiliser `noreply@klozd.app`

### Avantages de Resend :
- ✅ 100 emails/jour gratuits
- ✅ Interface simple
- ✅ Configuration rapide
- ✅ Pas besoin de vérifier le domaine pour les tests

---

## 🎯 Option 2 : SendGrid

### Étapes :

1. **Créer un compte sur SendGrid**
   - Allez sur https://sendgrid.com
   - Créez un compte gratuit (100 emails/jour gratuits)
   - Vérifiez votre email

2. **Obtenir une clé API**
   - Dans le dashboard, allez dans "Settings" > "API Keys"
   - Cliquez sur "Create API Key"
   - Donnez un nom et sélectionnez "Full Access" ou "Restricted Access" (Mail Send)
   - Copiez la clé API

3. **Configurer dans votre projet**
   - Ouvrez le fichier `.env` dans `apps/api/.env`
   - Ajoutez :
     ```env
     SENDGRID_API_KEY=votre_cle_api_ici
     EMAIL_FROM=noreply@votre-domaine.com
     FRONTEND_URL=http://localhost:3000
     ```

4. **Vérifier le domaine (recommandé)**
   - Dans SendGrid, allez dans "Settings" > "Sender Authentication"
   - Ajoutez et vérifiez votre domaine

---

## 📝 Variables d'environnement

Ajoutez ces variables dans `apps/api/.env` :

```env
# Option 1 : Resend (recommandé)
RESEND_API_KEY=re_votre_cle_api_ici

# OU Option 2 : SendGrid
SENDGRID_API_KEY=votre_cle_api_ici

# Email expéditeur (optionnel, par défaut: noreply@klozd.com)
EMAIL_FROM=noreply@votre-domaine.com

# URL du frontend (pour les liens de vérification)
FRONTEND_URL=http://localhost:3000
# En production : FRONTEND_URL=https://app.klozd.app
```

---

## 🧪 Tester la configuration

1. **Démarrer l'API** :
   ```bash
   cd apps/api
   pnpm start:dev
   ```

2. **Créer un compte de test** :
   - Allez sur http://localhost:3000/register
   - Créez un compte
   - Vérifiez votre boîte email

3. **Vérifier les logs** :
   - Si l'email est envoyé, vous verrez dans les logs : `✅ Email envoyé avec succès`
   - Si non configuré, vous verrez : `⚠️ Aucun service d'email configuré`

---

## ⚠️ Important

- **Pour les tests** : Vous pouvez utiliser Resend sans vérifier de domaine
- **Pour la production** : Vérifiez votre domaine pour éviter que les emails soient marqués comme spam
- **Sécurité** : Ne commitez JAMAIS vos clés API dans Git. Utilisez `.env` qui est dans `.gitignore`

---

## 🔗 Liens utiles

- **Resend** : https://resend.com
- **SendGrid** : https://sendgrid.com
- **Documentation Resend** : https://resend.com/docs
- **Documentation SendGrid** : https://docs.sendgrid.com

---

## 💡 Recommandation

Pour commencer rapidement, utilisez **Resend** :
1. C'est plus simple à configurer
2. Interface plus intuitive
3. 100 emails/jour gratuits suffisent pour les tests
4. Pas besoin de vérifier le domaine pour commencer

Une fois en production, vous pouvez migrer vers SendGrid si vous avez besoin de plus de fonctionnalités.




