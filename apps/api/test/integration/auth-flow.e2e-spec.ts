import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp, resetDb } from '../helpers/app';
import { PrismaService } from '../../src/prisma/prisma.service';
import { registerAndVerifyAndLogin } from '../helpers/auth';
import { expect } from '@jest/globals';

describe('Auth Flow (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;
  let prisma: PrismaService;

  beforeAll(async () => {
    const testApp = await bootstrapTestApp();
    app = testApp.app;
    httpServer = testApp.httpServer;
    prisma = testApp.prisma;
  });

  beforeEach(async () => {
    await resetDb(prisma);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('should register -> verify -> login -> access protected endpoint', async () => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test1234!';

    // 1. Register
    const registerResponse = await request(httpServer)
      .post('/auth/register')
      .send({
        email,
        password,
        firstName: 'Test',
        lastName: 'User',
        organizationName: `Test Org ${Date.now()}`,
      })
      .expect(201);

    expect(registerResponse.body).toHaveProperty('requiresVerification', true);
    expect(registerResponse.body).toHaveProperty('email', email);

    // 2. Get verification code (dev endpoint)
    const codeResponse = await request(httpServer)
      .get(`/auth/dev/verification-code/${email}`)
      .expect(200);

    expect(codeResponse.body).toHaveProperty('verificationCode');
    const verificationCode = codeResponse.body.verificationCode;

    // 3. Verify email
    const verifyResponse = await request(httpServer)
      .post('/auth/verify-email-code')
      .send({
        email,
        code: verificationCode,
      })
      .expect(200);

    expect(verifyResponse.body).toHaveProperty('message');

    // 4. Login
    const loginResponse = await request(httpServer)
      .post('/auth/login')
      .send({
        email,
        password,
      })
      .expect(200);

    expect(loginResponse.body).toHaveProperty('accessToken');
    const token = loginResponse.body.accessToken;

    // 5. Access protected endpoint
    const usersResponse = await request(httpServer)
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .query({ limit: 1 })
      .expect(200);

    expect(usersResponse.body).toHaveProperty('items');
    expect(usersResponse.body).toHaveProperty('pageInfo');
    expect(Array.isArray(usersResponse.body.items)).toBe(true);
  });

  it('should fail to access protected endpoint without token', async () => {
    await request(httpServer)
      .get('/users')
      .expect(401);
  });

  it('should fail to login with unverified email', async () => {
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test1234!';

    // Register
    await request(httpServer)
      .post('/auth/register')
      .send({
        email,
        password,
        firstName: 'Test',
        lastName: 'User',
        organizationName: `Test Org ${Date.now()}`,
      })
      .expect(201);

    // Try to login without verification
    await request(httpServer)
      .post('/auth/login')
      .send({
        email,
        password,
      })
      .expect(401);
  });
});
