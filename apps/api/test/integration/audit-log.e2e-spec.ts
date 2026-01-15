import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp } from '../helpers/app';
import { PrismaService } from '../../src/prisma/prisma.service';
import { expect } from '@jest/globals';
import * as bcrypt from 'bcrypt';

describe('Audit Log E2E Tests', () => {
  let app: INestApplication;
  let httpServer: any;
  let prisma: PrismaService;

  let organization: { id: string; name: string; slug: string };
  let user: { id: string; email: string; password: string; token: string };
  let lead: { id: string; email: string };

  beforeAll(async () => {
    const testApp = await bootstrapTestApp();
    app = testApp.app;
    httpServer = testApp.httpServer;
    prisma = testApp.prisma;

    // Create organization
    organization = await prisma.organization.create({
      data: {
        name: 'Test Organization Audit',
        slug: 'test-org-audit',
      },
    });

    // Create user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const createdUser = await prisma.user.create({
      data: {
        email: 'audit-test@example.com',
        password: hashedPassword,
        firstName: 'Audit',
        lastName: 'Test',
        role: 'ADMIN',
        organizationId: organization.id,
        emailVerified: true,
        status: 'ACTIVE',
      },
    });

    user = {
      id: createdUser.id,
      email: createdUser.email,
      password: 'password123',
      token: 'test-token', // Will be replaced with real token after login
    };

    // Login to get token
    const loginResponse = await request(httpServer)
      .post('/auth/login')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(200);

    user.token = loginResponse.body.accessToken;

    // Wait a bit for async operations
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create a lead for testing
    const form = await prisma.form.create({
      data: {
        name: 'Test Form',
        slug: 'test-form-audit',
        status: 'ACTIVE',
        organizationId: organization.id,
      },
    });

    lead = await prisma.lead.create({
      data: {
        email: 'lead-audit@example.com',
        firstName: 'Lead',
        lastName: 'Audit',
        organizationId: organization.id,
        formId: form.id,
        status: 'NEW',
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.auditLog.deleteMany({});
    await prisma.lead.deleteMany({ where: { organizationId: organization.id } });
    await prisma.form.deleteMany({ where: { organizationId: organization.id } });
    await prisma.user.deleteMany({ where: { organizationId: organization.id } });
    await prisma.organization.delete({ where: { id: organization.id } });
    await app.close();
    await prisma.$disconnect();
  });

  describe('Audit Log on Lead Update', () => {
    it('should create an audit log entry when updating a lead', async () => {
      // Update the lead
      const updateResponse = await request(httpServer)
        .patch(`/leads/${lead.id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          status: 'QUALIFIED',
          budget: 5000,
        })
        .expect(200);

      expect(updateResponse.body).toBeDefined();

      // Wait a bit for async audit log
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check audit log
      const auditLogs = await prisma.auditLog.findMany({
        where: {
          organizationId: organization.id,
          entityType: 'LEAD',
          entityId: lead.id,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      expect(auditLogs.length).toBeGreaterThan(0);
      const auditLog = auditLogs[0];

      expect(auditLog.action).toBe('QUALIFY');
      expect(auditLog.entityType).toBe('LEAD');
      expect(auditLog.entityId).toBe(lead.id);
      expect(auditLog.actorUserId).toBe(user.id);
      expect(auditLog.beforeJson).toBeDefined();
      expect(auditLog.afterJson).toBeDefined();

      // Parse JSON
      const before = JSON.parse(auditLog.beforeJson || '{}');
      const after = JSON.parse(auditLog.afterJson || '{}');

      expect(before.status).toBe('NEW');
      expect(after.status).toBe('QUALIFIED');
    });
  });

  describe('Audit Log on Form Update', () => {
    it('should create an audit log entry when updating a form', async () => {
      // Create a form
      const form = await prisma.form.create({
        data: {
          name: 'Test Form Update',
          slug: 'test-form-update-audit',
          status: 'DRAFT',
          organizationId: organization.id,
        },
      });

      // Update the form (publish it)
      const updateResponse = await request(httpServer)
        .patch(`/forms/${form.id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          status: 'ACTIVE',
        })
        .expect(200);

      expect(updateResponse.body).toBeDefined();

      // Wait a bit for async audit log
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check audit log
      const auditLogs = await prisma.auditLog.findMany({
        where: {
          organizationId: organization.id,
          entityType: 'FORM',
          entityId: form.id,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      expect(auditLogs.length).toBeGreaterThan(0);
      const auditLog = auditLogs[0];

      expect(auditLog.action).toBe('PUBLISH');
      expect(auditLog.entityType).toBe('FORM');
      expect(auditLog.entityId).toBe(form.id);
      expect(auditLog.actorUserId).toBe(user.id);

      // Parse JSON
      const before = JSON.parse(auditLog.beforeJson || '{}');
      const after = JSON.parse(auditLog.afterJson || '{}');

      expect(before.status).toBe('DRAFT');
      expect(after.status).toBe('ACTIVE');
    });
  });

  describe('GET /admin/audit-logs', () => {
    it('should return paginated audit logs', async () => {
      const response = await request(httpServer)
        .get('/admin/audit-logs')
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('pageInfo');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should filter audit logs by entityType', async () => {
      const response = await request(httpServer)
        .get('/admin/audit-logs')
        .query({ entityType: 'LEAD' })
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(response.body.items.every((log: any) => log.entityType === 'LEAD')).toBe(true);
    });

    it('should filter audit logs by action', async () => {
      const response = await request(httpServer)
        .get('/admin/audit-logs')
        .query({ action: 'QUALIFY' })
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(response.body.items.every((log: any) => log.action === 'QUALIFY')).toBe(true);
    });
  });
});
