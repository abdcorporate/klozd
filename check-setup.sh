#!/bin/bash

echo "🔍 Vérification de la configuration KLOZD..."
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier Node.js
echo -n "Node.js: "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Non installé${NC}"
    echo "   Installe avec: brew install node (macOS) ou depuis nodejs.org"
fi

# Vérifier pnpm
echo -n "pnpm: "
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "${GREEN}✅ $PNPM_VERSION${NC}"
else
    echo -e "${RED}❌ Non installé${NC}"
    echo "   Installe avec: npm install -g pnpm"
fi

# Vérifier PostgreSQL
echo -n "PostgreSQL: "
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version | head -n1)
    echo -e "${GREEN}✅ $PSQL_VERSION${NC}"
else
    echo -e "${RED}❌ Non installé${NC}"
    echo "   macOS: brew install postgresql@14"
    echo "   Linux: sudo apt install postgresql-14"
    echo "   Windows: Télécharge depuis postgresql.org"
fi

# Vérifier le fichier .env de l'API
echo ""
echo -n "Fichier apps/api/.env: "
if [ -f "apps/api/.env" ]; then
    echo -e "${GREEN}✅ Existe${NC}"
    
    # Vérifier DATABASE_URL
    if grep -q "DATABASE_URL" apps/api/.env; then
        DB_URL=$(grep DATABASE_URL apps/api/.env | cut -d'=' -f2 | tr -d '"')
        if [[ $DB_URL == *"localhost"* ]] || [[ $DB_URL == *"127.0.0.1"* ]]; then
            echo -e "   ${GREEN}✅ DATABASE_URL configuré${NC}"
        else
            echo -e "   ${YELLOW}⚠️  DATABASE_URL semble incorrect${NC}"
        fi
    else
        echo -e "   ${RED}❌ DATABASE_URL manquant${NC}"
    fi
    
    # Vérifier JWT_SECRET
    if grep -q "JWT_SECRET" apps/api/.env; then
        JWT_SECRET=$(grep JWT_SECRET apps/api/.env | cut -d'=' -f2 | tr -d '"')
        if [ "$JWT_SECRET" != "your-super-secret-jwt-key-change-in-production" ] && [ ${#JWT_SECRET} -gt 20 ]; then
            echo -e "   ${GREEN}✅ JWT_SECRET configuré${NC}"
        else
            echo -e "   ${YELLOW}⚠️  JWT_SECRET doit être changé${NC}"
        fi
    else
        echo -e "   ${RED}❌ JWT_SECRET manquant${NC}"
    fi
else
    echo -e "${RED}❌ Manquant${NC}"
    echo "   Crée le fichier avec: cp apps/api/.env.example apps/api/.env (si existe)"
    echo "   Sinon, crée-le manuellement (voir SETUP.md)"
fi

# Vérifier le fichier .env.local du web
echo ""
echo -n "Fichier apps/web/.env.local: "
if [ -f "apps/web/.env.local" ]; then
    echo -e "${GREEN}✅ Existe${NC}"
    if grep -q "NEXT_PUBLIC_API_URL" apps/web/.env.local; then
        echo -e "   ${GREEN}✅ NEXT_PUBLIC_API_URL configuré${NC}"
    else
        echo -e "   ${RED}❌ NEXT_PUBLIC_API_URL manquant${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Manquant (optionnel en dev)${NC}"
fi

# Vérifier Prisma
echo ""
echo -n "Client Prisma généré: "
if [ -d "apps/api/node_modules/.prisma/client" ] || [ -f "apps/api/node_modules/@prisma/client/index.js" ]; then
    echo -e "${GREEN}✅ Oui${NC}"
else
    echo -e "${YELLOW}⚠️  Non généré${NC}"
    echo "   Exécute: cd apps/api && pnpm prisma:generate"
fi

# Vérifier les migrations
echo ""
echo -n "Migrations Prisma: "
if [ -d "apps/api/prisma/migrations" ] && [ "$(ls -A apps/api/prisma/migrations 2>/dev/null)" ]; then
    MIGRATION_COUNT=$(ls -1 apps/api/prisma/migrations | wc -l | tr -d ' ')
    echo -e "${GREEN}✅ $MIGRATION_COUNT migration(s)${NC}"
else
    echo -e "${RED}❌ Aucune migration${NC}"
    echo "   Exécute: cd apps/api && pnpm prisma:migrate dev --name init"
fi

echo ""
echo "📋 Résumé:"
echo "   Si tout est ✅, tu peux lancer: pnpm dev"
echo "   Sinon, consulte SETUP.md pour les étapes manquantes"
echo ""





