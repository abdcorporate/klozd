import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@klozd.app';
  
  console.log(`\n🔐 Vérification de l'email: ${email}\n`);
  
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      emailVerified: true,
    },
  });

  if (!user) {
    console.error(`❌ Utilisateur avec l'email ${email} non trouvé.`);
    return;
  }

  if (user.emailVerified) {
    console.log(`✅ L'email ${email} est déjà vérifié.`);
    return;
  }

  // Marquer l'email comme vérifié
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationCode: null,
      verificationCodeExpiresAt: null,
    },
  });

  console.log(`✅ Email ${email} marqué comme vérifié avec succès !`);
  console.log(`   Utilisateur: ${user.firstName} ${user.lastName}`);
  console.log(`   ID: ${user.id}\n`);
}

main()
  .catch((e) => {
    console.error('Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



