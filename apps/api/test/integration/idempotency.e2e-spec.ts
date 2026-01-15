import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp } from '../helpers/app';
import { PrismaService } from '../../src/prisma/prisma.service';
import { expect } from '@jest/globals';

describe('Idempotency E2E Tests', () => {
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
        slug: 'test-org-idempotency',
      },
    });

    // Create form
    form = await prisma.form.create({
      data: {
        name: 'Test Form',
        slug: 'test-form-idempotency',
        status: 'ACTIVE',
        organizationId: organization.id,
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.idempotencyKey.deleteMany({});
    await prisma.form.deleteMany({ where: { organizationId: organization.id } });
    await prisma.organization.delete({ where: { id: organization.id } });
    await app.close();
    await prisma.$disconnect();
  });

  describe('POST /leads/forms/:formId/submit - Idempotency-Key Required', () => {
    it('should return 400 when Idempotency-Key header is missing', async () => {
      const response = await request(httpServer)
        .post(`/leads/forms/${form.id}/submit`)
        .send({
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          data: {},
        })
        .expect(400);

      expect(response.body.message).toContain('Idempotency-Key header is required');
    });

    it('should return 400 when Idempotency-Key is not a valid UUID v4', async () => {
      const response = await request(httpServer)
        .post(`/leads/forms/${form.id}/submit`)
        .set('Idempotency-Key', 'invalid-key')
        .send({
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          data: {},
        })
        .expect(400);

      expect(response.body.message).toContain('Idempotency-Key must be a valid UUID v4');
    });
  });

  describe('POST /leads/forms/:formId/submit - Idempotency Behavior', () => {
    const idempotencyKey = '550e8400-e29b-41d4-a716-446655440000';
    const submitData = {
      email: 'idempotency-test@example.com',
      firstName: 'Idempotency',
      lastName: 'Test',
      data: {
        budget: '5000',
        secteur: 'Tech',
      },
    };

    it('should return the same response for identical requests with same Idempotency-Key', async () => {
      // First request
      const firstResponse = await request(httpServer)
        .post(`/leads/forms/${form.id}/submit`)
        .set('Idempotency-Key', idempotencyKey)
        .send(submitData)
        .expect(200);

      expect(firstResponse.body).toHaveProperty('lead');
      expect(firstResponse.body.lead).toHaveProperty('id');
      const firstLeadId = firstResponse.body.lead.id;

      // Second request with same key and same body
      const secondResponse = await request(httpServer)
        .post(`/leads/forms/${form.id}/submit`)
        .set('Idempotency-Key', idempotencyKey)
        .send(submitData)
        .expect(200);

      // Should return the same response
      expect(secondResponse.body.lead.id).toBe(firstLeadId);
      expect(JSON.stringify(secondResponse.body)).toBe(JSON.stringify(firstResponse.body));

      // Verify only one lead was created
      const leads = await prisma.lead.findMany({
        where: {
          email: submitData.email,
          organizationId: organization.id,
        },
      });
      expect(leads).toHaveLength(1);
    });

    it('should return 409 Conflict when same Idempotency-Key is used with different request body', async () => {
      const differentIdempotencyKey = '550e8400-e29b-41d4-a716-446655440001';
      const firstData = {
        email: 'conflict-test@example.com',
        firstName: 'Conflict',
        lastName: 'Test',
        data: {
          budget: '3000',
        },
      };

      // First request
      await request(httpServer)
        .post(`/leads/forms/${form.id}/submit`)
        .set('Idempotency-Key', differentIdempotencyKey)
        .send(firstData)
        .expect(200);

      // Second request with same key but different body
      const secondData = {
        email: 'conflict-test@example.com',
        firstName: 'Conflict',
        lastName: 'Test',
        data: {
          budget: '10000', // Different value
        },
      };

      const conflictResponse = await request(httpServer)
        .post(`/leads/forms/${form.id}/submit`)
        .set('Idempotency-Key', differentIdempotencyKey)
        .send(secondData)
        .expect(409);

      expect(conflictResponse.body.message).toContain('Idempotency-Key conflict');
      expect(conflictResponse.body.message).toContain('different request body');
    });
  });
});
