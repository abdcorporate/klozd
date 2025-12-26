import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDashboardData() {
  console.log('🔍 Vérification des données pour le dashboard...\n');

  // Lister toutes les organisations
  const organizations = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  console.log(`📊 Organisations trouvées: ${organizations.length}\n`);

  for (const org of organizations) {
    console.log(`\n🏢 Organisation: ${org.name} (${org.id})`);
    console.log(`   Slug: ${org.slug}`);

    // Compter les leads
    const totalLeads = await prisma.lead.count({
      where: { organizationId: org.id },
    });
    console.log(`   📋 Leads totaux: ${totalLeads}`);

    const qualifiedLeads = await prisma.lead.count({
      where: {
        organizationId: org.id,
        status: 'QUALIFIED',
      },
    });
    console.log(`   ✅ Leads qualifiés: ${qualifiedLeads}`);

    // Compter les appointments
    const appointments = await prisma.appointment.count({
      where: {
        lead: {
          organizationId: org.id,
        },
      },
    });
    console.log(`   📅 Appointments: ${appointments}`);

    // Compter les deals
    const deals = await prisma.deal.count({
      where: { organizationId: org.id },
    });
    console.log(`   💼 Deals: ${deals}`);

    // Compter les utilisateurs
    const users = await prisma.user.count({
      where: { organizationId: org.id },
    });
    console.log(`   👥 Utilisateurs: ${users}`);
  }

  await prisma.$disconnect();
}

checkDashboardData().catch(console.error);
