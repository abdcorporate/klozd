import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        organization: {
          select: {
            name: true,
            slug: true,
          },
        },
        createdAt: true,
      },
      orderBy: [
        { organization: { name: 'asc' } },
        { role: 'asc' },
        { lastName: 'asc' },
      ],
    });

    console.log('\n📋 LISTE DES UTILISATEURS\n');
    console.log('═'.repeat(100));

    if (users.length === 0) {
      console.log('Aucun utilisateur trouvé dans la base de données.');
    } else {
      let currentOrg = '';
      users.forEach((user, index) => {
        if (user.organization.name !== currentOrg) {
          if (index > 0) {
            console.log('');
          }
          currentOrg = user.organization.name;
          console.log(`\n🏢 Organisation: ${currentOrg} (${user.organization.slug})`);
          console.log('─'.repeat(100));
        }

        const roleEmoji = {
          ADMIN: '👑',
          MANAGER: '👔',
          CLOSER: '🎯',
          SETTER: '📞',
          SUPER_ADMIN: '⚙️',
        };

        const statusEmoji = {
          ACTIVE: '✅',
          INACTIVE: '⏸️',
          SUSPENDED: '🚫',
        };

        console.log(
          `  ${roleEmoji[user.role] || '👤'} ${user.firstName} ${user.lastName}`,
        );
        console.log(`     📧 ${user.email}`);
        console.log(
          `     ${statusEmoji[user.status] || '❓'} Rôle: ${user.role} | Statut: ${user.status}`,
        );
        console.log(
          `     📅 Créé le: ${user.createdAt.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}`,
        );
        console.log('');
      });
    }

    console.log('═'.repeat(100));
    console.log(`\n📊 Total: ${users.length} utilisateur(s)\n`);

    // Statistiques par rôle
    const statsByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📈 Répartition par rôle:');
    Object.entries(statsByRole)
      .sort(([, a], [, b]) => b - a)
      .forEach(([role, count]) => {
        console.log(`   ${role}: ${count}`);
      });

    // Statistiques par statut
    const statsByStatus = users.reduce((acc, user) => {
      acc[user.status] = (acc[user.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 Répartition par statut:');
    Object.entries(statsByStatus)
      .sort(([, a], [, b]) => b - a)
      .forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });

    console.log('');
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();


