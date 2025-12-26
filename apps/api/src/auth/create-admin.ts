import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Script pour créer un utilisateur SUPER_ADMIN (Super Admin KLOZD)
 * Usage: ts-node apps/api/src/auth/create-admin.ts
 */

async function createAdmin() {
  const prisma = new PrismaClient();

  const email = process.env.ADMIN_EMAIL || 'super-admin@klozd.app';
  const password = process.env.ADMIN_PASSWORD || 'admin123456';
  const firstName = process.env.ADMIN_FIRST_NAME || 'Super';
  const lastName = process.env.ADMIN_LAST_NAME || 'Admin';

  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      if (existingAdmin.role === 'SUPER_ADMIN') {
        console.log(`✅ L'admin ${email} existe déjà avec le rôle SUPER_ADMIN`);
        return;
      } else {
        // Mettre à jour le rôle existant et vérifier l'email
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { 
            role: 'SUPER_ADMIN',
            emailVerified: true, // Les admins sont automatiquement vérifiés
          },
        });
        console.log(`✅ L'utilisateur ${email} a été promu SUPER_ADMIN et son email a été vérifié`);
        return;
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer une organisation spéciale pour l'admin (ou utiliser null si pas nécessaire)
    // Pour un Super Admin, on peut créer une organisation "KLOZD Internal"
    let organization = await prisma.organization.findFirst({
      where: { slug: 'klozd-internal' },
    });

    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: 'KLOZD Internal',
          slug: 'klozd-internal',
          settings: {
            create: {
              subscriptionPlan: 'enterprise',
              monthlyPrice: 0,
            },
          },
        },
      });
    }

    // Créer l'utilisateur admin
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        organizationId: organization.id,
        emailVerified: true, // Les admins sont automatiquement vérifiés
      },
    });

    console.log(`✅ Admin créé avec succès !`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Mot de passe: ${password}`);
    console.log(`👤 Nom: ${firstName} ${lastName}`);
    console.log(`🔐 Rôle: SUPER_ADMIN`);
    console.log(`\n⚠️  IMPORTANT: Changez le mot de passe après la première connexion !`);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

