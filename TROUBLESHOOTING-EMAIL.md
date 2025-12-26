# 🔧 Dépannage - Envoi d'emails Resend

## ❌ Problème : Email de vérification non reçu

### 🔍 Diagnostic

1. **Vérifier les logs de l'API**
   ```bash
   # Regardez les logs au démarrage de l'API
   # Vous devriez voir : "✅ Resend configuré pour l'envoi d'emails"
   ```

2. **Vérifier dans Resend Dashboard**
   - Allez sur https://resend.com/emails
   - Vérifiez si l'email apparaît dans la liste
   - Si oui, vérifiez le statut (delivered, bounced, etc.)
   - Si non, l'email n'a pas été envoyé

3. **Vérifier la configuration**
   ```bash
   cd apps/api
   grep RESEND_API_KEY .env
   # Doit afficher : RESEND_API_KEY=re_...
   ```

### ⚠️ Problème le plus courant : Domaine non vérifié

**Resend nécessite un domaine vérifié pour envoyer des emails.**

Le domaine `noreply@klozd.com` n'est probablement pas vérifié dans votre compte Resend.

### ✅ Solutions

#### Solution 1 : Utiliser l'email de test Resend (pour les tests)

1. Allez dans Resend Dashboard > Settings
2. Utilisez `onboarding@resend.dev` comme EMAIL_FROM (temporairement)
3. Ou ajoutez votre domaine et vérifiez-le

**Modifier `.env` :**
```env
EMAIL_FROM=onboarding@resend.dev
```

#### Solution 2 : Vérifier votre domaine dans Resend

1. Allez sur https://resend.com/domains
2. Cliquez sur "Add Domain"
3. Entrez votre domaine (ex: `klozd.app`)
4. Suivez les instructions pour configurer les DNS
5. Une fois vérifié, utilisez `noreply@klozd.app`

**Modifier `.env` :**
```env
EMAIL_FROM=noreply@votre-domaine-verifie.com
```

#### Solution 3 : Vérifier les logs détaillés

Après avoir créé un compte, regardez les logs de l'API :

```bash
# Vous devriez voir :
✅ Resend configuré pour l'envoi d'emails (clé: re_HGfqLG8...)
✅ Email de vérification envoyé à votre@email.com
✅ Email envoyé via Resend à votre@email.com: Vérifiez votre adresse email - KLOZD (ID: ...)
```

Si vous voyez des erreurs :
```
❌ Erreur Resend: { "message": "..." }
```

### 📋 Checklist de vérification

- [ ] `RESEND_API_KEY` est configuré dans `.env`
- [ ] L'API a été redémarrée après l'ajout de la clé
- [ ] Les logs montrent "✅ Resend configuré"
- [ ] Le domaine dans `EMAIL_FROM` est vérifié dans Resend
- [ ] L'email n'est pas dans les spams
- [ ] Vérifier dans Resend Dashboard > Emails si l'email apparaît

### 🔗 Liens utiles

- **Resend Dashboard** : https://resend.com/emails
- **Resend Domains** : https://resend.com/domains
- **Documentation Resend** : https://resend.com/docs

### 💡 Pour les tests rapides

Utilisez `onboarding@resend.dev` dans `EMAIL_FROM` :
```env
EMAIL_FROM=onboarding@resend.dev
```

Cet email fonctionne sans vérification de domaine, mais est limité aux tests.




