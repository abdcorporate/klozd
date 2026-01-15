import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp, resetDb } from '../helpers/app';
import { PrismaService } from '../../src/prisma/prisma.service';
import { expect } from '@jest/globals';

describe('Ownership Authorization E2E Tests', () => {
  let app: INestApplication;
  let httpServer: any;
  let prisma: PrismaService;

  let org: { id: string; name: string; slug: string };
  let closer1: { id: string; email: string; token: string };
  let closer2: { id: string; email: string; token: string };
  let setter1: { id: string; email: string; token: string };
  let setter2: { id: string; email: string; token: string };
  let lead1: { id: string; email: string }; // Assigné à closer1
  let lead2: { id: string; email: string }; // Assigné à closer2
  let lead3: { id: string; email: string }; // Non assigné
  let appointment1: { id: string }; // Assigné à closer1
  let appointment2: { id: string }; // Assigné à closer2
  let deal1: { id: string }; // Créé par closer1
  let deal2: { id: string }; // Créé par closer2

  beforeAll(async () => {
    const testApp = await bootstrapTestApp();
    app = testApp.app;
    httpServer = testApp.httpServer;
    prisma = testApp.prisma;

    // Activer l'ownership check pour les tests
    process.env.ENABLE_OWNERSHIP_CHECK = 'true';

    // Créer l'organisation
    org = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        slug: 'test-org-ownership',
      },
    });

    // Créer les utilisateurs
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('password123', 10);

    closer1 = await prisma.user.create({
      data: {
        email: 'closer1@test.com',
        password: hashedPassword,
        firstName: 'Closer',
        lastName: 'One',
        role: 'CLOSER',
        organizationId: org.id,
        emailVerified: true,
      },
    });

    closer2 = await prisma.user.create({
      data: {
        email: 'closer2@test.com',
        password: hashedPassword,
        firstName: 'Closer',
        lastName: 'Two',
        role: 'CLOSER',
        organizationId: org.id,
        emailVerified: true,
      },
    });

    setter1 = await prisma.user.create({
      data: {
        email: 'setter1@test.com',
        password: hashedPassword,
        firstName: 'Setter',
        lastName: 'One',
        role: 'SETTER',
        organizationId: org.id,
        emailVerified: true,
      },
    });

    setter2 = await prisma.user.create({
      data: {
        email: 'setter2@test.com',
        password: hashedPassword,
        firstName: 'Setter',
        lastName: 'Two',
        role: 'SETTER',
        organizationId: org.id,
        emailVerified: true,
      },
    });

    // Authentifier les utilisateurs
    const loginCloser1 = await request(httpServer)
      .post('/auth/login')
      .send({ email: closer1.email, password: 'password123' });

    const loginCloser2 = await request(httpServer)
      .post('/auth/login')
      .send({ email: closer2.email, password: 'password123' });

    const loginSetter1 = await request(httpServer)
      .post('/auth/login')
      .send({ email: setter1.email, password: 'password123' });

    const loginSetter2 = await request(httpServer)
      .post('/auth/login')
      .send({ email: setter2.email, password: 'password123' });

    closer1.token = loginCloser1.body.accessToken;
    closer2.token = loginCloser2.body.accessToken;
    setter1.token = loginSetter1.body.accessToken;
    setter2.token = loginSetter2.body.accessToken;

    // Créer un formulaire
    const form = await prisma.form.create({
      data: {
        name: 'Test Form',
        slug: 'test-form-ownership',
        status: 'ACTIVE',
        organizationId: org.id,
      },
    });

    // Créer les leads
    lead1 = await prisma.lead.create({
      data: {
        email: 'lead1@test.com',
        firstName: 'Lead',
        lastName: 'One',
        organizationId: org.id,
        formId: form.id,
        status: 'QUALIFIED',
        assignedCloserId: closer1.id,
        assignedSetterId: setter1.id,
      },
    });

    lead2 = await prisma.lead.create({
      data: {
        email: 'lead2@test.com',
        firstName: 'Lead',
        lastName: 'Two',
        organizationId: org.id,
        formId: form.id,
        status: 'QUALIFIED',
        assignedCloserId: closer2.id,
        assignedSetterId: setter2.id,
      },
    });

    lead3 = await prisma.lead.create({
      data: {
        email: 'lead3@test.com',
        firstName: 'Lead',
        lastName: 'Three',
        organizationId: org.id,
        formId: form.id,
        status: 'QUALIFIED',
        // Non assigné
      },
    });

    // Créer les appointments
    appointment1 = await prisma.appointment.create({
      data: {
        leadId: lead1.id,
        assignedCloserId: closer1.id,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        duration: 30,
        status: 'SCHEDULED',
      },
    });

    appointment2 = await prisma.appointment.create({
      data: {
        leadId: lead2.id,
        assignedCloserId: closer2.id,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        duration: 30,
        status: 'SCHEDULED',
      },
    });

    // Créer les deals
    deal1 = await prisma.deal.create({
      data: {
        leadId: lead1.id,
        organizationId: org.id,
        createdById: closer1.id,
        title: 'Deal 1',
        value: 1000,
        stage: 'QUALIFIED',
        status: 'ACTIVE',
      },
    });

    deal2 = await prisma.deal.create({
      data: {
        leadId: lead2.id,
        organizationId: org.id,
        createdById: closer2.id,
        title: 'Deal 2',
        value: 2000,
        stage: 'QUALIFIED',
        status: 'ACTIVE',
      },
    });
  });

  // Pas de resetDb ici car on veut garder les données entre les tests

  afterAll(async () => {
    // Nettoyer
    await prisma.deal.deleteMany({
      where: { id: { in: [deal1.id, deal2.id] } },
    });
    await prisma.appointment.deleteMany({
      where: { id: { in: [appointment1.id, appointment2.id] } },
    });
    await prisma.lead.deleteMany({
      where: { id: { in: [lead1.id, lead2.id, lead3.id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [closer1.id, closer2.id, setter1.id, setter2.id] } },
    });
    await prisma.organization.deleteMany({
      where: { id: org.id },
    });

    await app.close();
    await prisma.$disconnect();
  });

  describe('CLOSER Ownership - Leads', () => {
    it('should allow closer1 to GET their own lead (lead1)', async () => {
      const response = await request(httpServer)
        .get(`/leads/${lead1.id}`)
        .set('Authorization', `Bearer ${closer1.token}`)
        .expect(200);

      expect(response.body.id).toBe(lead1.id);
      expect(response.body.assignedCloserId).toBe(closer1.id);
    });

    it('should allow closer1 to GET unassigned lead (lead3)', async () => {
      const response = await request(httpServer)
        .get(`/leads/${lead3.id}`)
        .set('Authorization', `Bearer ${closer1.token}`)
        .expect(200);

      expect(response.body.id).toBe(lead3.id);
    });

    it('should deny closer1 to GET lead assigned to closer2 (lead2)', async () => {
      const response = await request(httpServer)
        .get(`/leads/${lead2.id}`)
        .set('Authorization', `Bearer ${closer1.token}`)
        .expect(403);

      expect(response.body.message).toContain('accès');
    });
  });

  describe('CLOSER Ownership - Appointments', () => {
    it('should allow closer1 to GET their own appointment (appointment1)', async () => {
      const response = await request(httpServer)
        .get(`/scheduling/appointments/${appointment1.id}`)
        .set('Authorization', `Bearer ${closer1.token}`)
        .expect(200);

      expect(response.body.id).toBe(appointment1.id);
      expect(response.body.assignedCloserId).toBe(closer1.id);
    });

    it('should deny closer1 to GET appointment assigned to closer2 (appointment2)', async () => {
      const response = await request(httpServer)
        .get(`/scheduling/appointments/${appointment2.id}`)
        .set('Authorization', `Bearer ${closer1.token}`)
        .expect(403);

      expect(response.body.message).toContain('accès');
    });
  });

  describe('CLOSER Ownership - Deals', () => {
    it('should allow closer1 to PATCH their own deal (deal1)', async () => {
      const response = await request(httpServer)
        .patch(`/crm/deals/${deal1.id}`)
        .set('Authorization', `Bearer ${closer1.token}`)
        .send({ title: 'Updated Deal 1' })
        .expect(200);

      expect(response.body.title).toBe('Updated Deal 1');
    });

    it('should deny closer1 to PATCH deal created by closer2 (deal2)', async () => {
      const response = await request(httpServer)
        .patch(`/crm/deals/${deal2.id}`)
        .set('Authorization', `Bearer ${closer1.token}`)
        .send({ title: 'Hacked Deal' })
        .expect(403);

      expect(response.body.message).toContain('accès');
    });
  });

  describe('SETTER Ownership - Leads', () => {
    it('should allow setter1 to GET their own lead (lead1)', async () => {
      const response = await request(httpServer)
        .get(`/leads/${lead1.id}`)
        .set('Authorization', `Bearer ${setter1.token}`)
        .expect(200);

      expect(response.body.id).toBe(lead1.id);
      expect(response.body.assignedSetterId).toBe(setter1.id);
    });

    it('should allow setter1 to GET unassigned lead (lead3)', async () => {
      const response = await request(httpServer)
        .get(`/leads/${lead3.id}`)
        .set('Authorization', `Bearer ${setter1.token}`)
        .expect(200);

      expect(response.body.id).toBe(lead3.id);
    });

    it('should deny setter1 to GET lead assigned to setter2 (lead2)', async () => {
      const response = await request(httpServer)
        .get(`/leads/${lead2.id}`)
        .set('Authorization', `Bearer ${setter1.token}`)
        .expect(403);

      expect(response.body.message).toContain('accès');
    });
  });
});
