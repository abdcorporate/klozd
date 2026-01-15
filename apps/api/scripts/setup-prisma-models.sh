#!/bin/bash
# Script pour créer la migration Prisma et régénérer le client
# Ce script résout toutes les erreurs TypeScript liées aux modèles Prisma manquants

set -e

echo "🔧 Création de la migration Prisma pour les nouveaux modèles..."
echo ""

cd "$(dirname "$0")/.."

# Vérifier que Prisma est installé
if ! command -v pnpm &> /dev/null; then
  echo "❌ pnpm n'est pas installé"
  exit 1
fi

# Vérifier que le schéma Prisma existe
if [ ! -f "prisma/schema.prisma" ]; then
  echo "❌ Le fichier prisma/schema.prisma n'existe pas"
  exit 1
fi

echo "📋 Vérification des modèles dans le schéma..."
echo ""

# Vérifier que les modèles sont présents
MODELS=("RefreshToken" "AuditLog" "IdempotencyKey" "MessageDelivery")
MISSING_MODELS=()

for model in "${MODELS[@]}"; do
  if ! grep -q "model $model" prisma/schema.prisma; then
    MISSING_MODELS+=("$model")
  fi
done

if [ ${#MISSING_MODELS[@]} -gt 0 ]; then
  echo "❌ Modèles manquants dans le schéma Prisma:"
  for model in "${MISSING_MODELS[@]}"; do
    echo "   - $model"
  done
  exit 1
fi

echo "✅ Tous les modèles sont présents dans le schéma"
echo ""

# Créer la migration
echo "🚀 Création de la migration..."
echo ""

pnpm prisma migrate dev --name add_refresh_tokens_audit_logs_idempotency_message_delivery

echo ""
echo "✅ Migration créée avec succès !"
echo ""
echo "📦 Régénération du client Prisma..."
echo ""

pnpm prisma generate

echo ""
echo "✅ Client Prisma régénéré !"
echo ""
echo "🎉 Toutes les erreurs TypeScript liées aux modèles Prisma devraient maintenant être résolues."
echo ""
echo "💡 Pour vérifier, exécutez : pnpm build"
