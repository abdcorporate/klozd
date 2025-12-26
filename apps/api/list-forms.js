const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listForms() {
  try {
    const forms = await prisma.form.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            formFields: true,
            submissions: true,
            leads: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('\n=== LISTE DES FORMULAIRES ===\n');
    console.log(`Total: ${forms.length} formulaire(s)\n`);

    if (forms.length === 0) {
      console.log('Aucun formulaire trouvé.');
    } else {
      forms.forEach((form, index) => {
        console.log(`${index + 1}. ${form.name}`);
        console.log(`   ID: ${form.id}`);
        console.log(`   Slug: ${form.slug}`);
        console.log(`   Statut: ${form.status}`);
        console.log(`   Organisation ID: ${form.organizationId}`);
        if (form.organization) {
          console.log(`   Organisation: ${form.organization.name} (${form.organization.slug})`);
        } else {
          console.log(`   Organisation: NON TROUVÉE`);
        }
        console.log(`   Champs: ${form._count.formFields}`);
        console.log(`   Soumissions: ${form._count.submissions}`);
        console.log(`   Leads: ${form._count.leads}`);
        console.log(`   Créé le: ${form.createdAt}`);
        console.log('');
      });
    }

    // Aussi lister les organisations
    console.log('\n=== LISTE DES ORGANISATIONS ===\n');
    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            forms: true,
            users: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Total: ${organizations.length} organisation(s)\n`);

    organizations.forEach((org, index) => {
      console.log(`${index + 1}. ${org.name}`);
      console.log(`   ID: ${org.id}`);
      console.log(`   Slug: ${org.slug}`);
      console.log(`   Formulaires: ${org._count.forms}`);
      console.log(`   Utilisateurs: ${org._count.users}`);
      console.log('');
    });

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listForms();

