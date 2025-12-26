import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUserEmail() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Usage: npx tsx scripts/verify-user-email.ts <email>');
    process.exit(1);
  }

  try {
    console.log(`🔍 Recherche de l'utilisateur: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        organizationId: true,
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      console.log(`❌ Aucun utilisateur trouvé avec l'email ${email}`);
      await prisma.$disconnect();
      return;
    }

    console.log(`\n📋 Informations de l'utilisateur:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nom: ${user.firstName} ${user.lastName}`);
    console.log(`   Rôle: ${user.role}`);
    console.log(`   Organisation: ${user.organization?.name || 'Aucune'}`);
    console.log(`   Email vérifié: ${user.emailVerified ? '✅ OUI' : '❌ NON'}`);

    if (!user.emailVerified) {
      console.log(`\n🔧 Mise à jour de l'email comme vérifié...`);
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          verificationCode: null,
          verificationCodeExpiresAt: null,
        },
      });

      console.log(`✅ Email marqué comme vérifié pour ${email}`);
    } else {
      console.log(`\n✅ L'email est déjà vérifié`);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUserEmail();



