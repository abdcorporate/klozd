import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Script pour créer un utilisateur pour chaque rôle
 * Usage: ts-node apps/api/src/auth/create-all-roles.ts
 */

const roles = [
  { role: 'ADMIN', email: 'admin@klozd.app', password: 'admin123456', firstName: 'Admin', lastName: 'KLOZD' },
  { role: 'MANAGER', email: 'manager@klozd.app', password: 'manager123456', firstName: 'Manager', lastName: 'KLOZD' },
  { role: 'CLOSER', email: 'closer@klozd.app', password: 'closer123456', firstName: 'Closer', lastName: 'KLOZD' },
  { role: 'SETTER', email: 'setter@klozd.app', password: 'setter123456', firstName: 'Setter', lastName: 'KLOZD' },
];

async function createAllRoles() {
  const prisma = new PrismaClient();

  try {
    // Trouver ou créer une organisation par défaut
    let organization = await prisma.organization.findFirst({
      where: { slug: 'klozd-demo' },
    });

    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: 'KLOZD Demo',
          slug: 'klozd-demo',
          settings: {
            create: {
              subscriptionPlan: 'pro',
              monthlyPrice: 197,
            },
          },
        },
      });
      console.log(`📦 Organisation créée: ${organization.name}\n`);
    } else {
      console.log(`📦 Organisation existante: ${organization.name}\n`);
    }

    console.log('🚀 Création des comptes pour tous les rôles...\n');

    for (const { role, email, password, firstName, lastName } of roles) {
      try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          if (existingUser.role === role) {
            console.log(`✅ ${role}: ${email} existe déjà`);
            continue;
          } else {
            // Mettre à jour le rôle
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { role: role as any },
            });
            console.log(`✅ ${role}: ${email} mis à jour (rôle changé)`);
            continue;
          }
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur
        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: role as any,
            status: 'ACTIVE',
            organizationId: organization.id,
          },
        });

        console.log(`✅ ${role} créé:`);
        console.log(`   📧 Email: ${email}`);
        console.log(`   🔑 Mot de passe: ${password}`);
        console.log(`   👤 Nom: ${firstName} ${lastName}`);
        console.log(`   🏢 Organisation: ${organization.name}`);
        console.log('');
      } catch (error: any) {
        console.error(`❌ Erreur lors de la création du ${role}:`, error.message);
        console.log('');
      }
    }

    console.log('✨ Tous les comptes ont été créés !\n');
    console.log('📋 Récapitulatif des identifiants :');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    roles.forEach(({ role, email, password }) => {
      console.log(`${role.padEnd(10)} | ${email.padEnd(25)} | ${password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Changez les mots de passe après la première connexion !');
  } catch (error) {
    console.error('❌ Erreur générale:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAllRoles();



