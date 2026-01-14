import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { expect } from '@jest/globals';

export interface AuthResult {
  token: string;
  user: {
    id: string;
    email: string;
    organizationId: string;
  };
  organization: {
    id: string;
    name: string;
  };
}

/**
 * Register, verify email, and login a user
 * Returns token, user, and organization
 * Requires prisma to fetch organization details
 */
export async function registerAndVerifyAndLogin(
  httpServer: any,
  prisma: PrismaClient,
  email: string = `test-${Date.now()}@example.com`,
  password: string = 'Test1234!',
  firstName: string = 'Test',
  lastName: string = 'User',
): Promise<AuthResult> {
  // 1. Register
  const registerResponse = await request(httpServer)
    .post('/auth/register')
    .send({
      email,
      password,
      firstName,
      lastName,
      organizationName: `Test Org ${Date.now()}`,
    })
    .expect(201);

  expect(registerResponse.body.requiresVerification).toBe(true);

  // 2. Get verification code (dev endpoint)
  // Encode email for URL to handle special characters
  const encodedEmail = encodeURIComponent(email);
  const codeResponse = await request(httpServer)
    .get(`/auth/dev/verification-code/${encodedEmail}`)
    .expect(200);

  const verificationCode = codeResponse.body.verificationCode;
  expect(verificationCode).toBeDefined();

  // 3. Verify email
  await request(httpServer)
    .post('/auth/verify-email-code')
    .send({
      email,
      code: verificationCode,
    })
    .expect(200);

  // 4. Login
  const loginResponse = await request(httpServer)
    .post('/auth/login')
    .send({
      email,
      password,
    })
    .expect(200);

  const token = loginResponse.body.accessToken || loginResponse.body.access_token;
  expect(token).toBeDefined();

  // 5. Fetch user directly from Prisma using email (API doesn't return organizationId for non-SUPER_ADMIN)
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      organizationId: true,
    },
  });

  expect(user).toBeDefined();
  expect(user?.organizationId).toBeDefined();

  // 6. Fetch organization details from Prisma
  const organization = await prisma.organization.findUnique({
    where: { id: user!.organizationId },
  });

  expect(organization).toBeDefined();
  expect(organization?.id).toBeDefined();

  return {
    token,
    user: {
      id: user!.id,
      email: user!.email,
      organizationId: user!.organizationId,
    },
    organization: {
      id: organization!.id,
      name: organization!.name,
    },
  };
}

/**
 * Create an organization and admin user directly via Prisma
 * Faster for tests that don't need the full auth flow
 */
export async function createTestOrgAndAdmin(
  prisma: PrismaClient,
  email: string = `admin-${Date.now()}@example.com`,
): Promise<AuthResult> {
  const organization = await prisma.organization.create({
    data: {
      name: 'Test Organization',
      slug: `test-org-${Date.now()}`,
    },
  });

  const hashedPassword = await import('bcrypt').then((bcrypt) =>
    bcrypt.hash('Test1234!', 10),
  );

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      organizationId: organization.id,
      emailVerified: true,
    },
  });

  // Generate a JWT token (simplified - in real tests you might want to use the actual auth service)
  // For now, we'll use the login endpoint
  return {
    token: '', // Will be set by calling login
    user: {
      id: user.id,
      email: user.email,
      organizationId: organization.id,
    },
    organization: {
      id: organization.id,
      name: organization.name,
    },
  };
}
