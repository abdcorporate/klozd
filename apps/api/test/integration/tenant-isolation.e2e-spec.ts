import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp, resetDb } from '../helpers/app';
import { PrismaService } from '../../src/prisma/prisma.service';
import { expect } from '@jest/globals';

describe('Tenant Isolation E2E Tests', () => {
  let app: INestApplication;
  let httpServer: any;
  let prisma: PrismaService;

  let orgA: { id: string; name: string; slug: string };
  let orgB: { id: string; name: string; slug: string };
  let userA: { id: string; email: string; password: string; token: string };
  let userB: { id: string; email: string; password: string; token: string };
  let leadA: { id: string; email: string };
  let leadB: { id: string; email: string };
  let formA: { id: string; slug: string };
  let formB: { id: string; slug: string };
  let appointmentA: { id: string };
  let appointmentB: { id: string };

  beforeAll(async () => {
    const testApp = await bootstrapTestApp();
    app = testApp.app;
    httpServer = testApp.httpServer;
    prisma = testApp.prisma;

    // Créer les organisations
    orgA = await prisma.organization.create({
      data: {
        name: 'Organization A',
        slug: 'org-a-test',
      },
    });

    orgB = await prisma.organization.create({
      data: {
        name: 'Organization B',
        slug: 'org-b-test',
      },
    });

    // Créer les utilisateurs
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('password123', 10);

    userA = await prisma.user.create({
      data: {
        email: 'usera@test.com',
        password: hashedPassword,
        firstName: 'User',
        lastName: 'A',
        role: 'ADMIN',
        organizationId: orgA.id,
        emailVerified: true,
      },
    });

    userB = await prisma.user.create({
      data: {
        email: 'userb@test.com',
        password: hashedPassword,
        firstName: 'User',
        lastName: 'B',
        role: 'ADMIN',
        organizationId: orgB.id,
        emailVerified: true,
      },
    });

    // Authentifier les utilisateurs
    const loginA = await request(httpServer)
      .post('/auth/login')
      .send({ email: userA.email, password: 'password123' });

    const loginB = await request(httpServer)
      .post('/auth/login')
      .send({ email: userB.email, password: 'password123' });

    userA.token = loginA.body.accessToken;
    userB.token = loginB.body.accessToken;

    // Créer les formulaires
    formA = await prisma.form.create({
      data: {
        name: 'Form A',
        slug: 'form-a-test',
        status: 'ACTIVE',
        organizationId: orgA.id,
      },
    });

    formB = await prisma.form.create({
      data: {
        name: 'Form B',
        slug: 'form-b-test',
        status: 'ACTIVE',
        organizationId: orgB.id,
      },
    });

    // Créer les leads
    leadA = await prisma.lead.create({
      data: {
        email: 'leada@test.com',
        firstName: 'Lead',
        lastName: 'A',
        organizationId: orgA.id,
        formId: formA.id,
        status: 'NEW',
      },
    });

    leadB = await prisma.lead.create({
      data: {
        email: 'leadb@test.com',
        firstName: 'Lead',
        lastName: 'B',
        organizationId: orgB.id,
        formId: formB.id,
        status: 'NEW',
      },
    });

    // Créer les appointments
    appointmentA = await prisma.appointment.create({
      data: {
        leadId: leadA.id,
        assignedCloserId: userA.id,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
        duration: 30,
        status: 'SCHEDULED',
      },
    });

    appointmentB = await prisma.appointment.create({
      data: {
        leadId: leadB.id,
        assignedCloserId: userB.id,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
        duration: 30,
        status: 'SCHEDULED',
      },
    });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('Lead Isolation', () => {
    it('should return 404 when user org A tries to GET /leads/:id of lead org B', async () => {
      const response = await request(httpServer)
        .get(`/leads/${leadB.id}`)
        .set('Authorization', `Bearer ${userA.token}`)
        .expect(404);

      expect(response.body.message).toContain('Lead non trouvé');
    });

    it('should return 200 when user org A gets their own lead', async () => {
      const response = await request(httpServer)
        .get(`/leads/${leadA.id}`)
        .set('Authorization', `Bearer ${userA.token}`)
        .expect(200);

      expect(response.body.id).toBe(leadA.id);
      expect(response.body.organizationId).toBe(orgA.id);
    });
  });

  describe('Form Isolation', () => {
    it('should return 404 when user org A tries to PATCH /forms/:id of form org B', async () => {
      const response = await request(httpServer)
        .patch(`/forms/${formB.id}`)
        .set('Authorization', `Bearer ${userA.token}`)
        .send({ name: 'Hacked Form' })
        .expect(404);

      expect(response.body.message).toContain('Formulaire');
    });

    it('should return 200 when user org A updates their own form', async () => {
      const response = await request(httpServer)
        .patch(`/forms/${formA.id}`)
        .set('Authorization', `Bearer ${userA.token}`)
        .send({ name: 'Updated Form A' })
        .expect(200);

      expect(response.body.name).toBe('Updated Form A');
      expect(response.body.organizationId).toBe(orgA.id);
    });
  });

  describe('Appointment Isolation', () => {
    it('should return 404 when user org A tries to GET /scheduling/appointments/:id of appointment org B', async () => {
      const response = await request(httpServer)
        .get(`/scheduling/appointments/${appointmentB.id}`)
        .set('Authorization', `Bearer ${userA.token}`)
        .expect(404);

      expect(response.body.message).toContain('Rendez-vous non trouvé');
    });

    it('should return 200 when user org A gets their own appointment', async () => {
      const response = await request(httpServer)
        .get(`/scheduling/appointments/${appointmentA.id}`)
        .set('Authorization', `Bearer ${userA.token}`)
        .expect(200);

      expect(response.body.id).toBe(appointmentA.id);
      expect(response.body.lead.organizationId).toBe(orgA.id);
    });
  });
});
