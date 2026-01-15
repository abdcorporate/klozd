# Régénération du client Prisma

## Problème

Le client Prisma n'a pas été régénéré après l'ajout des modèles `WaitlistEntry` et les modifications de `MessageDelivery`.

## Solution

Exécutez la commande suivante pour régénérer le client Prisma :

```bash
cd apps/api
pnpm prisma generate
```

Ou utilisez le script automatisé :

```bash
cd apps/api
pnpm run prisma:setup-models
```

Cette commande va :
1. Synchroniser le schéma avec la base de données (si nécessaire)
2. Générer le client Prisma avec les nouveaux types TypeScript

## Après régénération

Une fois le client régénéré, les erreurs TypeScript suivantes devraient disparaître :
- `Property 'waitlistEntry' does not exist on type 'PrismaService'`
- `Property 'organizationId_channel_to_templateKey_payloadHash' does not exist`
- `Property 'templateKey' does not exist`
- `Property 'errorCode' does not exist`

## Migration de la base de données

Si les tables n'existent pas encore dans la base de données, exécutez :

```bash
cd apps/api
pnpm prisma migrate dev --name add_waitlist_entry_and_message_delivery_updates
```

Ou pour forcer la synchronisation (attention : peut causer une perte de données) :

```bash
cd apps/api
pnpm prisma db push
```
