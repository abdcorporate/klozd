import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp } from '../helpers/app';
import { PrismaService } from '../../src/prisma/prisma.service';
import { expect } from '@jest/globals';
import * as bcrypt from 'bcrypt';

describe('Auth Refresh Token E2E Tests', () => {
  let app: INestApplication;
  let httpServer: any;
  let prisma: PrismaService;

  let organization: { id: string; name: string; slug: string };
  let user: { id: string; email: string; password: string };

  beforeAll(async () => {
    const testApp = await bootstrapTestApp();
    app = testApp.app;
    httpServer = testApp.httpServer;
    prisma = testApp.prisma;

    // Create organization
    organization = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        slug: 'test-org-refresh',
      },
    });

    // Create user
    const hashedPassword = await bcrypt.hash('password123', 10);
    user = await prisma.user.create({
      data: {
        email: 'refresh-test@example.com',
        password: hashedPassword,
        firstName: 'Refresh',
        lastName: 'Test',
        role: 'ADMIN',
        organizationId: organization.id,
        emailVerified: true,
        status: 'ACTIVE',
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({ where: { organizationId: organization.id } });
    await prisma.organization.delete({ where: { id: organization.id } });
    await app.close();
    await prisma.$disconnect();
  });

  describe('POST /auth/login - Refresh Token in Cookie', () => {
    it('should set refresh token in HttpOnly cookie on login', async () => {
      const response = await request(httpServer)
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'password123',
        })
        .expect(200);

      // Vérifier que l'access token est dans la réponse JSON
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(user.email);

      // Vérifier que le refresh token est dans un cookie HttpOnly
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((cookie: string) => cookie.includes('refreshToken'))).toBe(true);
      expect(cookies.some((cookie: string) => cookie.includes('HttpOnly'))).toBe(true);

      // Vérifier qu'un refresh token a été créé en DB
      const refreshTokens = await prisma.refreshToken.findMany({
        where: { userId: user.id },
      });
      expect(refreshTokens.length).toBeGreaterThan(0);
    });
  });

  describe('POST /auth/refresh - Token Rotation', () => {
    it('should rotate refresh token and return new access token', async () => {
      // 1. Login pour obtenir un refresh token
      const loginResponse = await request(httpServer)
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'password123',
        })
        .expect(200);

      const cookies = loginResponse.headers['set-cookie'];
      const refreshTokenCookie = cookies.find((c: string) => c.startsWith('refreshToken='));

      // Extraire le refresh token du cookie (pour vérification en DB)
      const refreshTokenValue = refreshTokenCookie?.split(';')[0]?.split('=')[1];

      // Vérifier qu'un refresh token existe en DB
      const oldTokens = await prisma.refreshToken.findMany({
        where: {
          userId: user.id,
          revokedAt: null,
        },
      });
      expect(oldTokens.length).toBeGreaterThan(0);
      const oldTokenId = oldTokens[0].id;

      // 2. Appeler /auth/refresh avec le cookie
      const refreshResponse = await request(httpServer)
        .post('/auth/refresh')
        .set('Cookie', refreshTokenCookie || '')
        .expect(200);

      // Vérifier que le nouvel access token est retourné
      expect(refreshResponse.body).toHaveProperty('accessToken');
      expect(refreshResponse.body.accessToken).not.toBe(loginResponse.body.accessToken);

      // Vérifier qu'un nouveau cookie refresh token est retourné
      const newCookies = refreshResponse.headers['set-cookie'];
      expect(newCookies).toBeDefined();
      expect(newCookies.some((cookie: string) => cookie.includes('refreshToken'))).toBe(true);

      // 3. Vérifier que l'ancien token est révoqué (rotation)
      const revokedToken = await prisma.refreshToken.findUnique({
        where: { id: oldTokenId },
      });
      expect(revokedToken?.revokedAt).not.toBeNull();
      expect(revokedToken?.replacedById).not.toBeNull();

      // 4. Vérifier qu'un nouveau token a été créé
      const newTokens = await prisma.refreshToken.findMany({
        where: {
          userId: user.id,
          revokedAt: null,
        },
      });
      expect(newTokens.length).toBeGreaterThan(0);
      expect(newTokens.some((t) => t.id === revokedToken?.replacedById)).toBe(true);
    });

    it('should reject refresh with invalid token', async () => {
      const response = await request(httpServer)
        .post('/auth/refresh')
        .set('Cookie', 'refreshToken=invalid-token')
        .expect(401);

      expect(response.body.message).toContain('Refresh token');
    });

    it('should reject refresh without cookie', async () => {
      const response = await request(httpServer)
        .post('/auth/refresh')
        .expect(401);

      expect(response.body.message).toContain('Refresh token manquant');
    });
  });

  describe('POST /auth/logout', () => {
    it('should revoke refresh token and clear cookie on logout', async () => {
      // 1. Login
      const loginResponse = await request(httpServer)
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'password123',
        })
        .expect(200);

      const accessToken = loginResponse.body.accessToken;
      const cookies = loginResponse.headers['set-cookie'];
      const refreshTokenCookie = cookies.find((c: string) => c.startsWith('refreshToken='));

      // Vérifier qu'un refresh token existe
      const tokensBefore = await prisma.refreshToken.findMany({
        where: {
          userId: user.id,
          revokedAt: null,
        },
      });
      expect(tokensBefore.length).toBeGreaterThan(0);

      // 2. Logout avec access token
      const logoutResponse = await request(httpServer)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', refreshTokenCookie || '')
        .expect(200);

      expect(logoutResponse.body.message).toContain('Déconnexion réussie');

      // Vérifier que le cookie est supprimé
      const logoutCookies = logoutResponse.headers['set-cookie'];
      if (logoutCookies) {
        const clearCookie = logoutCookies.find((c: string) => c.includes('refreshToken='));
        expect(clearCookie).toBeDefined();
        expect(clearCookie?.includes('Max-Age=0') || clearCookie?.includes('expires=')).toBe(true);
      }

      // Vérifier que le refresh token est révoqué en DB
      const tokensAfter = await prisma.refreshToken.findMany({
        where: {
          userId: user.id,
          revokedAt: null,
        },
      });
      expect(tokensAfter.length).toBe(0);
    });

    it('should handle logout even if refresh token is already invalid', async () => {
      // Login
      const loginResponse = await request(httpServer)
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'password123',
        })
        .expect(200);

      const accessToken = loginResponse.body.accessToken;

      // Logout sans cookie (token déjà invalide)
      const logoutResponse = await request(httpServer)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(logoutResponse.body.message).toContain('Déconnexion réussie');
    });
  });
});
