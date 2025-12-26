import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteInvitation() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Usage: pnpm tsx scripts/delete-invitation.ts <email>');
    process.exit(1);
  }

  try {
    console.log(`🔍 Recherche des invitations pour: ${email}`);

    const invitations = await prisma.invitation.findMany({
      where: { email },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    if (invitations.length === 0) {
      console.log(`✅ Aucune invitation trouvée pour ${email}`);
      await prisma.$disconnect();
      return;
    }

    console.log(`\n📋 Invitations trouvées (${invitations.length}):`);
    invitations.forEach((inv, index) => {
      console.log(`\n${index + 1}. ID: ${inv.id}`);
      console.log(`   Email: ${inv.email}`);
      console.log(`   Rôle: ${inv.role}`);
      console.log(`   Organisation: ${inv.organization.name}`);
      console.log(`   Statut: ${inv.status}`);
      console.log(`   Créée le: ${inv.createdAt}`);
    });

    // Supprimer toutes les invitations pour cet email
    const result = await prisma.invitation.deleteMany({
      where: { email },
    });

    console.log(`\n✅ ${result.count} invitation(s) supprimée(s) pour ${email}`);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteInvitation();



