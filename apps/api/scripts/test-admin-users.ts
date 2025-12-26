import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 Test de la requête admin pour les utilisateurs\n');
  
  // Simuler la requête admin
  const users = await prisma.user.findMany({
    where: {},
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      organizationId: true,
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`✅ Trouvé ${users.length} utilisateur(s)\n`);
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`   Rôle: ${user.role}`);
    console.log(`   Organisation: ${user.organization?.name || 'N/A'} (${user.organizationId})`);
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error('Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
