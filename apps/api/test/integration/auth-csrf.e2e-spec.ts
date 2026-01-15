import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp } from '../helpers/app';
import { PrismaService } from '../../src/prisma/prisma.service';
import { expect } from '@jest/globals';
import * as bcrypt from 'bcrypt';

describe('Auth CSRF Protection E2E Tests', () => {
  let app: INestApplication;
  let httpServer: any;
  let prisma: PrismaService;

  let organization: { id: string; name: string; slug: string };
  let user: { id: string; email: string; password: string };
  let refreshToken: string;
  let accessToken: string;

  beforeAll(async () => {
    const testApp = await bootstrapTestApp();
    app = testApp.app;
    httpServer = testApp.httpServer;
    prisma = testApp.prisma;

    // Create organization
    organization = await prisma.organization.create({
      data: {
        name: 'Test Organization CSRF',
        slug: 'test-org-csrf',
      },
    });

    // Create user
    const hashedPassword = await bcrypt.hash('password123', 10);
    user = await prisma.user.create({
      data: {
        email: 'csrf-test@example.com',
        password: hashedPassword,
        firstName: 'CSRF',
        lastName: 'Test',
        role: 'ADMIN',
        organizationId: organization.id,
        emailVerified: true,
        status: 'ACTIVE',
      },
    });

    // Login to get tokens
    const loginResponse = await request(httpServer)
      .post('/auth/login')
      .send({
        email: user.email,
        password: 'password123',
      })
      .expect(200);

    accessToken = loginResponse.body.accessToken;
    
    // Extract refresh token from cookie
    const cookies = loginResponse.headers['set-cookie'];
    const refreshTokenCookie = cookies?.find((cookie: string) => cookie.startsWith('refreshToken='));
    if (refreshTokenCookie) {
      refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];
    }
  });

  afterAll(async () => {
    // Clean up
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({ where: { organizationId: organization.id } });
    await prisma.organization.delete({ where: { id: organization.id } });
    await app.close();
  });

  describe('GET /auth/csrf', () => {
    it('should return CSRF token and set it in cookie', async () => {
      const response = await request(httpServer)
        .get('/auth/csrf')
        .expect(200);

      expect(response.body).toHaveProperty('csrfToken');
      expect(response.body.csrfToken).toBeTruthy();
      expect(typeof response.body.csrfToken).toBe('string');
      expect(response.body.csrfToken.length).toBeGreaterThan(0);

      // Check cookie is set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const csrfCookie = cookies?.find((cookie: string) => cookie.startsWith('csrfToken='));
      expect(csrfCookie).toBeDefined();
      
      // Extract token from cookie
      const cookieToken = csrfCookie?.split(';')[0].split('=')[1];
      expect(cookieToken).toBe(response.body.csrfToken);
    });

    it('should set cookie with correct attributes', async () => {
      const response = await request(httpServer)
        .get('/auth/csrf')
        .expect(200);

      const cookies = response.headers['set-cookie'];
      const csrfCookie = cookies?.find((cookie: string) => cookie.startsWith('csrfToken='));
      
      // Cookie should not be HttpOnly (readable by JavaScript)
      expect(csrfCookie).not.toContain('HttpOnly');
      
      // Cookie should have Path=/
      expect(csrfCookie).toContain('Path=/');
    });
  });

  describe('POST /auth/refresh - CSRF Protection', () => {
    it('should return 403 when CSRF token is missing', async () => {
      await request(httpServer)
        .post('/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(403);
    });

    it('should return 403 when CSRF token header does not match cookie', async () => {
      // Get CSRF token
      const csrfResponse = await request(httpServer)
        .get('/auth/csrf')
        .expect(200);

      const csrfToken = csrfResponse.body.csrfToken;

      // Try with wrong token in header
      await request(httpServer)
        .post('/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}; csrfToken=${csrfToken}`)
        .set('X-CSRF-Token', 'wrong-token')
        .expect(403);
    });

    it('should return 200 when CSRF token header matches cookie', async () => {
      // Get CSRF token
      const csrfResponse = await request(httpServer)
        .get('/auth/csrf')
        .expect(200);

      const csrfToken = csrfResponse.body.csrfToken;

      // Refresh with correct CSRF token
      const response = await request(httpServer)
        .post('/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}; csrfToken=${csrfToken}`)
        .set('X-CSRF-Token', csrfToken)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.accessToken).toBeTruthy();
    });

    it('should return 401 when refresh token is invalid even with valid CSRF', async () => {
      // Get CSRF token
      const csrfResponse = await request(httpServer)
        .get('/auth/csrf')
        .expect(200);

      const csrfToken = csrfResponse.body.csrfToken;

      // Try with invalid refresh token but valid CSRF
      await request(httpServer)
        .post('/auth/refresh')
        .set('Cookie', `refreshToken=invalid-token; csrfToken=${csrfToken}`)
        .set('X-CSRF-Token', csrfToken)
        .expect(401);
    });
  });

  describe('POST /auth/logout - CSRF Protection', () => {
    it('should return 403 when CSRF token is missing', async () => {
      await request(httpServer)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(403);
    });

    it('should return 403 when CSRF token header does not match cookie', async () => {
      // Get CSRF token
      const csrfResponse = await request(httpServer)
        .get('/auth/csrf')
        .expect(200);

      const csrfToken = csrfResponse.body.csrfToken;

      // Try with wrong token in header
      await request(httpServer)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}; csrfToken=${csrfToken}`)
        .set('X-CSRF-Token', 'wrong-token')
        .expect(403);
    });

    it('should return 200 when CSRF token header matches cookie', async () => {
      // Get CSRF token
      const csrfResponse = await request(httpServer)
        .get('/auth/csrf')
        .expect(200);

      const csrfToken = csrfResponse.body.csrfToken;

      // Logout with correct CSRF token
      const response = await request(httpServer)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}; csrfToken=${csrfToken}`)
        .set('X-CSRF-Token', csrfToken)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Déconnexion réussie');
    });
  });
});
