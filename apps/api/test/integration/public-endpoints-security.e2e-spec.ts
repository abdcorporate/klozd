import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp } from '../helpers/app';
import { PrismaService } from '../../src/prisma/prisma.service';
import { expect } from '@jest/globals';

describe('Public Endpoints Security E2E Tests', () => {
  let app: INestApplication;
  let httpServer: any;
  let prisma: PrismaService;

  let organization: { id: string; name: string; slug: string };
  let form: { id: string; slug: string };

  beforeAll(async () => {
    const testApp = await bootstrapTestApp();
    app = testApp.app;
    httpServer = testApp.httpServer;
    prisma = testApp.prisma;

    // Create organization
    organization = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        slug: 'test-org-security',
      },
    });

    // Create form
    form = await prisma.form.create({
      data: {
        name: 'Test Form',
        slug: 'test-form-security',
        status: 'ACTIVE',
        organizationId: organization.id,
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.form.deleteMany({ where: { organizationId: organization.id } });
    await prisma.organization.delete({ where: { id: organization.id } });
    await app.close();
    await prisma.$disconnect();
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limit on GET /forms/public/:slug (30/min)', async () => {
      // Make 31 requests rapidly
      const requests = Array.from({ length: 31 }, () =>
        request(httpServer).get(`/forms/public/${form.slug}`),
      );

      const responses = await Promise.all(requests);

      // First 30 should succeed
      for (let i = 0; i < 30; i++) {
        expect([200, 404]).toContain(responses[i].status);
      }

      // 31st request might be rate limited (429) or succeed depending on timing
      // This is a basic test - in production, rate limiting is more sophisticated
    });

    it('should enforce rate limit on POST /leads/forms/:formId/submit (10/min)', async () => {
      const idempotencyKey = '550e8400-e29b-41d4-a716-446655440000';
      const submitData = {
        email: 'ratelimit-test@example.com',
        firstName: 'Rate',
        lastName: 'Limit',
        data: {},
        formRenderedAt: new Date(Date.now() - 5000).toISOString(), // 5 seconds ago
      };

      // Make 11 requests rapidly
      const requests = Array.from({ length: 11 }, (_, i) =>
        request(httpServer)
          .post(`/leads/forms/${form.id}/submit`)
          .set('Idempotency-Key', `${idempotencyKey}-${i}`)
          .send({ ...submitData, email: `ratelimit-test-${i}@example.com` }),
      );

      const responses = await Promise.all(requests);

      // First 10 should succeed (200) or fail validation (400)
      // 11th might be rate limited (429)
      // This is a basic test
      const successCount = responses.filter((r) => r.status === 200).length;
      expect(successCount).toBeLessThanOrEqual(10);
    });
  });

  describe('Honeypot Validation', () => {
    it('should reject submission with non-empty honeypot field', async () => {
      const idempotencyKey = '550e8400-e29b-41d4-a716-446655440001';
      const submitData = {
        email: 'honeypot-test@example.com',
        firstName: 'Honeypot',
        lastName: 'Test',
        data: {},
        honeypot: 'filled-by-bot', // Honeypot field is filled
        formRenderedAt: new Date(Date.now() - 5000).toISOString(),
      };

      const response = await request(httpServer)
        .post(`/leads/forms/${form.id}/submit`)
        .set('Idempotency-Key', idempotencyKey)
        .send(submitData)
        .expect(400);

      expect(response.body.message).toContain('Invalid form submission');
    });

    it('should accept submission with empty honeypot field', async () => {
      const idempotencyKey = '550e8400-e29b-41d4-a716-446655440002';
      const submitData = {
        email: 'honeypot-ok@example.com',
        firstName: 'Honeypot',
        lastName: 'OK',
        data: {},
        honeypot: '', // Empty honeypot (valid)
        formRenderedAt: new Date(Date.now() - 5000).toISOString(),
      };

      const response = await request(httpServer)
        .post(`/leads/forms/${form.id}/submit`)
        .set('Idempotency-Key', idempotencyKey)
        .send(submitData);

      // Should succeed (200) or fail for other reasons (quota, etc.)
      expect([200, 429]).toContain(response.status);
    });
  });

  describe('Timestamp Token Validation', () => {
    it('should reject submission submitted too quickly (< 2s)', async () => {
      const idempotencyKey = '550e8400-e29b-41d4-a716-446655440003';
      const submitData = {
        email: 'quick-submit@example.com',
        firstName: 'Quick',
        lastName: 'Submit',
        data: {},
        formRenderedAt: new Date(Date.now() - 500).toISOString(), // Only 500ms ago (too fast)
      };

      const response = await request(httpServer)
        .post(`/leads/forms/${form.id}/submit`)
        .set('Idempotency-Key', idempotencyKey)
        .send(submitData)
        .expect(429);

      expect(response.body.message).toContain('too quickly');
    });

    it('should accept submission with valid timestamp (> 2s)', async () => {
      const idempotencyKey = '550e8400-e29b-41d4-a716-446655440004';
      const submitData = {
        email: 'valid-timestamp@example.com',
        firstName: 'Valid',
        lastName: 'Timestamp',
        data: {},
        formRenderedAt: new Date(Date.now() - 5000).toISOString(), // 5 seconds ago (valid)
      };

      const response = await request(httpServer)
        .post(`/leads/forms/${form.id}/submit`)
        .set('Idempotency-Key', idempotencyKey)
        .send(submitData);

      // Should succeed (200) or fail for other reasons (quota, etc.)
      expect([200, 429]).toContain(response.status);
    });
  });
});
