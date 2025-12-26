import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserRoles() {
  try {
    // Mettre à jour admin@klozd.app -> SUPER_ADMIN
    await prisma.$executeRaw`
      UPDATE "User" 
      SET role = 'SUPER_ADMIN'::"UserRole"
      WHERE email = 'admin@klozd.app'
    `;

    const user1 = await prisma.user.findUnique({
      where: { email: 'admin@klozd.app' },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    if (user1) {
      console.log('✅ Utilisateur mis à jour:');
      console.log(`   ${user1.firstName} ${user1.lastName} (${user1.email})`);
      console.log(`   Organisation: ${user1.organization.name}`);
      console.log(`   Nouveau rôle: ${user1.role}\n`);
    }

    // Mettre à jour admin@abdcorporate.com -> ADMIN
    await prisma.$executeRaw`
      UPDATE "User" 
      SET role = 'ADMIN'::"UserRole"
      WHERE email = 'admin@abdcorporate.com'
    `;

    const user2 = await prisma.user.findUnique({
      where: { email: 'admin@abdcorporate.com' },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    if (user2) {
      console.log('✅ Utilisateur mis à jour:');
      console.log(`   ${user2.firstName} ${user2.lastName} (${user2.email})`);
      console.log(`   Organisation: ${user2.organization.name}`);
      console.log(`   Nouveau rôle: ${user2.role}\n`);
    }

    console.log('🎉 Mise à jour terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRoles();
