import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n📊 Liste des utilisateurs et statut de vérification email\n');
  console.log('='.repeat(100));
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      emailVerified: true,
      verificationCode: true,
      verificationCodeExpiresAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (users.length === 0) {
    console.log('Aucun utilisateur trouvé dans la base de données.\n');
    return;
  }

  console.log(`\nTotal: ${users.length} utilisateur(s)\n`);
  
  users.forEach((user, index) => {
    console.log(`\n${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Rôle: ${user.role}`);
    console.log(`   Statut: ${user.status}`);
    console.log(`   Email vérifié: ${user.emailVerified ? '✅ OUI' : '❌ NON'}`);
    
    if (user.verificationCode) {
      const expiresAt = user.verificationCodeExpiresAt;
      const isExpired = expiresAt && expiresAt < new Date();
      console.log(`   Code de vérification: ${user.verificationCode} ${isExpired ? '(⚠️ EXPIRÉ)' : '(✅ Valide)'}`);
      if (expiresAt) {
        console.log(`   Expire le: ${expiresAt.toLocaleString('fr-FR')}`);
      }
    } else {
      console.log(`   Code de vérification: Aucun`);
    }
    
    console.log(`   Créé le: ${user.createdAt.toLocaleString('fr-FR')}`);
    console.log(`   Modifié le: ${user.updatedAt.toLocaleString('fr-FR')}`);
    console.log('-'.repeat(100));
  });

  // Statistiques
  const verifiedCount = users.filter(u => u.emailVerified).length;
  const unverifiedCount = users.filter(u => !u.emailVerified).length;
  const withCodeCount = users.filter(u => u.verificationCode).length;
  
  console.log('\n📈 Statistiques:');
  console.log(`   ✅ Emails vérifiés: ${verifiedCount}`);
  console.log(`   ❌ Emails non vérifiés: ${unverifiedCount}`);
  console.log(`   🔑 Codes de vérification actifs: ${withCodeCount}`);
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



