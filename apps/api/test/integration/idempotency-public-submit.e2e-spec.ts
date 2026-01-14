import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp, resetDb } from '../helpers/app';
import { PrismaService } from '../../src/prisma/prisma.service';
import { registerAndVerifyAndLogin } from '../helpers/auth';
import { buildPublicSubmissionPayload, buildPublicBookingPayload } from '../helpers/factories';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { expect } from '@jest/globals';

describe('Idempotency Public Submit (e2e)', () => {
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

  describe('Form Submit Idempotency', () => {
    it('should replay same request with same Idempotency-Key without creating duplicates', async () => {
      // Create org + admin + form
      const auth = await registerAndVerifyAndLogin(httpServer, prisma);
      const { token, organization } = auth;

      const formResponse = await request(httpServer)
        .post('/forms')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Form',
          slug: `test-form-${Date.now()}`,
          status: 'ACTIVE', // Ensure form is active for public submission
          formFields: [
            {
              type: 'TEXT',
              label: 'Name',
              required: true,
              order: 0,
            },
            {
              type: 'EMAIL',
              label: 'Email',
              required: true,
              order: 1,
            },
          ],
        })
        .expect(201);

      const form = formResponse.body;
      const idempotencyKey = uuidv4();
      const submissionPayload = buildPublicSubmissionPayload(form);

      // First submission
      const response1 = await request(httpServer)
        .post(`/leads/forms/${form.id}/submit`)
        .set('Idempotency-Key', idempotencyKey)
        .send(submissionPayload)
        .expect(200);

      expect(response1.body).toHaveProperty('success', true);
      expect(response1.body).toHaveProperty('lead');
      const leadId1 = response1.body.lead.id;
      expect(leadId1).toBeDefined();

      // Second submission with same key + same body
      const response2 = await request(httpServer)
        .post(`/leads/forms/${form.id}/submit`)
        .set('Idempotency-Key', idempotencyKey)
        .send(submissionPayload)
        .expect(200);

      // Should return same lead ID
      expect(response2.body).toHaveProperty('success', true);
      expect(response2.body).toHaveProperty('lead');
      expect(response2.body.lead.id).toBe(leadId1);

      // Verify only ONE lead was created
      const leads = await prisma.lead.findMany({
        where: {
          email: submissionPayload.email,
          organizationId: organization.id,
        },
      });

      expect(leads.length).toBe(1);
      expect(leads[0].id).toBe(leadId1);

      // Verify idempotency record exists
      const idempotencyRecord = await prisma.idempotencyRecord.findUnique({
        where: {
          key_route: {
            key: idempotencyKey,
            route: `/leads/forms/${form.id}/submit`,
          },
        },
      });

      expect(idempotencyRecord).toBeDefined();
    });

    it('should return 409 when same key but different body', async () => {
      // Create org + admin + form
      const auth = await registerAndVerifyAndLogin(httpServer, prisma);
      const { token } = auth;

      const formResponse = await request(httpServer)
        .post('/forms')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Form',
          slug: `test-form-${Date.now()}`,
          status: 'ACTIVE', // Ensure form is active for public submission
          formFields: [
            {
              type: 'TEXT',
              label: 'Name',
              required: true,
              order: 0,
            },
            {
              type: 'EMAIL',
              label: 'Email',
              required: true,
              order: 1,
            },
          ],
        })
        .expect(201);

      const form = formResponse.body;
      const idempotencyKey = uuidv4();
      const submissionPayload1 = buildPublicSubmissionPayload(form, {
        email: 'test1@example.com',
      });
      const submissionPayload2 = buildPublicSubmissionPayload(form, {
        email: 'test2@example.com',
      });

      // First submission
      await request(httpServer)
        .post(`/leads/forms/${form.id}/submit`)
        .set('Idempotency-Key', idempotencyKey)
        .send(submissionPayload1)
        .expect(200);

      // Second submission with same key but different body
      const response2 = await request(httpServer)
        .post(`/leads/forms/${form.id}/submit`)
        .set('Idempotency-Key', idempotencyKey)
        .send(submissionPayload2)
        .expect(409);

      expect(response2.body).toHaveProperty('message');
      expect(response2.body.message).toContain('conflict');
    });
  });

  describe('Public Booking Idempotency', () => {
    it('should replay same booking request with same Idempotency-Key without creating duplicates', async () => {
      // Create org + admin
      const auth = await registerAndVerifyAndLogin(httpServer, prisma);
      const { organization } = auth;

      expect(organization.id).toBeDefined();

      // Create closer and lead
      const hashedPassword = await bcrypt.hash('Test1234!', 10);
      const closer = await prisma.user.create({
        data: {
          email: `closer-${Date.now()}@example.com`,
          password: hashedPassword,
          firstName: 'Closer',
          lastName: 'User',
          role: 'CLOSER',
          organizationId: organization.id,
          emailVerified: true,
        },
      });

      const lead = await prisma.lead.create({
        data: {
          email: `lead-${Date.now()}@example.com`,
          firstName: 'Lead',
          lastName: 'User',
          organizationId: organization.id,
          status: 'NEW',
        },
      });

      const scheduledAt = new Date();
      scheduledAt.setHours(scheduledAt.getHours() + 1);
      scheduledAt.setMinutes(0);
      scheduledAt.setSeconds(0);
      scheduledAt.setMilliseconds(0);

      const idempotencyKey = uuidv4();
      const bookingPayload = buildPublicBookingPayload(
        lead.id,
        closer.id,
        scheduledAt,
        30,
      );

      // First booking
      const response1 = await request(httpServer)
        .post('/scheduling/appointments/public')
        .set('Idempotency-Key', idempotencyKey)
        .send(bookingPayload)
        .expect(201);

      const appointmentId1 = response1.body.id;
      expect(appointmentId1).toBeDefined();

      // Second booking with same key + same body
      const response2 = await request(httpServer)
        .post('/scheduling/appointments/public')
        .set('Idempotency-Key', idempotencyKey)
        .send(bookingPayload)
        .expect(201);

      // Should return same appointment ID
      expect(response2.body.id).toBe(appointmentId1);

      // Verify only ONE appointment was created
      const appointments = await prisma.appointment.findMany({
        where: {
          leadId: lead.id,
          assignedCloserId: closer.id,
        },
      });

      expect(appointments.length).toBe(1);
      expect(appointments[0].id).toBe(appointmentId1);
    });

    it('should return 409 when same key but different booking body', async () => {
      // Create org + admin
      const auth = await registerAndVerifyAndLogin(httpServer, prisma);
      const { organization } = auth;

      expect(organization.id).toBeDefined();

      // Create closer and lead
      const hashedPassword = await bcrypt.hash('Test1234!', 10);
      const closer = await prisma.user.create({
        data: {
          email: `closer-${Date.now()}@example.com`,
          password: hashedPassword,
          firstName: 'Closer',
          lastName: 'User',
          role: 'CLOSER',
          organizationId: organization.id,
          emailVerified: true,
        },
      });

      const lead = await prisma.lead.create({
        data: {
          email: `lead-${Date.now()}@example.com`,
          firstName: 'Lead',
          lastName: 'User',
          organizationId: organization.id,
          status: 'NEW',
        },
      });

      const scheduledAt1 = new Date();
      scheduledAt1.setHours(scheduledAt1.getHours() + 1);
      scheduledAt1.setMinutes(0);
      scheduledAt1.setSeconds(0);
      scheduledAt1.setMilliseconds(0);

      const scheduledAt2 = new Date();
      scheduledAt2.setHours(scheduledAt2.getHours() + 2);
      scheduledAt2.setMinutes(0);
      scheduledAt2.setSeconds(0);
      scheduledAt2.setMilliseconds(0);

      const idempotencyKey = uuidv4();
      const bookingPayload1 = buildPublicBookingPayload(
        lead.id,
        closer.id,
        scheduledAt1,
        30,
      );
      const bookingPayload2 = buildPublicBookingPayload(
        lead.id,
        closer.id,
        scheduledAt2,
        30,
      );

      // First booking
      await request(httpServer)
        .post('/scheduling/appointments/public')
        .set('Idempotency-Key', idempotencyKey)
        .send(bookingPayload1)
        .expect(201);

      // Second booking with same key but different body
      const response2 = await request(httpServer)
        .post('/scheduling/appointments/public')
        .set('Idempotency-Key', idempotencyKey)
        .send(bookingPayload2)
        .expect(409);

      expect(response2.body).toHaveProperty('message');
      expect(response2.body.message).toContain('conflict');
    });
  });
});
