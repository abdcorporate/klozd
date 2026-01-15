import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

/**
 * Script pour créer un utilisateur SUPER_ADMIN (Super Admin KLOZD)
 * Usage: 
 *   ts-node apps/api/scripts/create-super-admin.ts
 *   ou
 *   pnpm tsx apps/api/scripts/create-super-admin.ts
 */

const prisma = new PrismaClient();

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function createSuperAdmin() {
  console.log('\n🔐 Création d\'un compte SUPER_ADMIN\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Demander les informations ou utiliser les variables d'environnement
    const email = process.env.ADMIN_EMAIL || await askQuestion('📧 Email: ');
    const password = process.env.ADMIN_PASSWORD || await askQuestion('🔑 Mot de passe: ');
    const firstName = process.env.ADMIN_FIRST_NAME || await askQuestion('👤 Prénom: ');
    const lastName = process.env.ADMIN_LAST_NAME || await askQuestion('👤 Nom: ');

    if (!email || !password || !firstName || !lastName) {
      console.error('❌ Tous les champs sont requis');
      process.exit(1);
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Format d\'email invalide');
      process.exit(1);
    }

    // Validation du mot de passe
    if (password.length < 8) {
      console.error('❌ Le mot de passe doit contenir au moins 8 caractères');
      process.exit(1);
    }

    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingAdmin) {
      if (existingAdmin.role === 'SUPER_ADMIN') {
        console.log(`\n✅ L'admin ${email} existe déjà avec le rôle SUPER_ADMIN`);
        console.log(`   ID: ${existingAdmin.id}`);
        console.log(`   Organisation: ${existingAdmin.organizationId}`);
        return;
      } else {
        // Mettre à jour le rôle existant
        const updated = await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { 
            role: 'SUPER_ADMIN',
            emailVerified: true,
          },
        });
        console.log(`\n✅ L'utilisateur ${email} a été promu SUPER_ADMIN`);
        console.log(`   ID: ${updated.id}`);
        console.log(`   Organisation: ${updated.organizationId}`);
        return;
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer ou récupérer l'organisation "KLOZD Internal"
    let organization = await prisma.organization.findFirst({
      where: { slug: 'klozd-internal' },
    });

    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: 'KLOZD Internal',
          slug: 'klozd-internal',
        },
      });
      console.log('✅ Organisation "KLOZD Internal" créée');
    }

    // Créer l'utilisateur admin
    const admin = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        organizationId: organization.id,
        emailVerified: true, // Les admins sont automatiquement vérifiés
      },
    });

    console.log('\n✅ SUPER_ADMIN créé avec succès !');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Mot de passe: ${password}`);
    console.log(`👤 Nom: ${admin.firstName} ${admin.lastName}`);
    console.log(`🔐 Rôle: ${admin.role}`);
    console.log(`🆔 ID: ${admin.id}`);
    console.log(`🏢 Organisation: ${organization.name} (${organization.id})`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Changez le mot de passe après la première connexion !\n');
  } catch (error: any) {
    console.error('\n❌ Erreur lors de la création du SUPER_ADMIN:', error.message);
    if (error.code === 'P2002') {
      console.error('   → Cet email est déjà utilisé par un autre utilisateur');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
createSuperAdmin();
