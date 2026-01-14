import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp, resetDb } from '../helpers/app';
import { PrismaService } from '../../src/prisma/prisma.service';
import { registerAndVerifyAndLogin } from '../helpers/auth';
import { buildPublicBookingPayload } from '../helpers/factories';
import * as bcrypt from 'bcrypt';
import { expect } from '@jest/globals';

describe('Public Booking Creates Appointment (e2e)', () => {
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

  it('should create an appointment via public booking endpoint', async () => {
    // Create org + admin user
    const auth = await registerAndVerifyAndLogin(httpServer, prisma);
    const { token, organization } = auth;

    expect(organization.id).toBeDefined();

    // Create a closer user in the same org
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

    // Create a lead in the same org
    const lead = await prisma.lead.create({
      data: {
        email: `lead-${Date.now()}@example.com`,
        firstName: 'Lead',
        lastName: 'User',
        organizationId: organization.id,
        status: 'NEW',
      },
    });

    // Create appointment via public endpoint
    const scheduledAt = new Date();
    scheduledAt.setHours(scheduledAt.getHours() + 1); // 1 hour from now
    scheduledAt.setMinutes(0);
    scheduledAt.setSeconds(0);
    scheduledAt.setMilliseconds(0);

    const bookingPayload = buildPublicBookingPayload(
      lead.id,
      closer.id,
      scheduledAt,
      30,
    );

    const bookingResponse = await request(httpServer)
      .post('/scheduling/appointments/public')
      .send(bookingPayload)
      .expect(201);

    expect(bookingResponse.body).toHaveProperty('id');
    expect(bookingResponse.body.leadId).toBe(lead.id);
    expect(bookingResponse.body.assignedCloserId).toBe(closer.id);

    // Verify appointment was created in DB
    const appointment = await prisma.appointment.findUnique({
      where: { id: bookingResponse.body.id },
      include: {
        lead: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    expect(appointment).toBeDefined();
    expect(appointment?.leadId).toBe(lead.id);
    expect(appointment?.assignedCloserId).toBe(closer.id);
    expect(appointment?.lead.organizationId).toBe(organization.id);
    expect(appointment?.status).toBe('SCHEDULED');

    // Update appointment status to COMPLETED
    const completeResponse = await request(httpServer)
      .post(`/scheduling/appointments/${appointment!.id}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .send({ outcome: 'Success' })
      .expect(200);

    expect(completeResponse.body.status).toBe('COMPLETED');
    expect(completeResponse.body.completedAt).toBeDefined();

    // Verify in DB
    const updatedAppointment = await prisma.appointment.findUnique({
      where: { id: appointment!.id },
    });
    expect(updatedAppointment?.status).toBe('COMPLETED');
    expect(updatedAppointment?.completedAt).toBeDefined();
  });

  it('should update appointment status to NO_SHOW', async () => {
    // Create org + admin user
    const auth = await registerAndVerifyAndLogin(httpServer, prisma);
    const { token, organization } = auth;

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

    // Create appointment
    const scheduledAt = new Date();
    scheduledAt.setHours(scheduledAt.getHours() + 1);
    scheduledAt.setMinutes(0);
    scheduledAt.setSeconds(0);
    scheduledAt.setMilliseconds(0);

    const bookingPayload = buildPublicBookingPayload(
      lead.id,
      closer.id,
      scheduledAt,
      30,
    );

    const bookingResponse = await request(httpServer)
      .post('/scheduling/appointments/public')
      .send(bookingPayload)
      .expect(201);

    const appointmentId = bookingResponse.body.id;

    // Mark as no-show
    const noShowResponse = await request(httpServer)
      .post(`/scheduling/appointments/${appointmentId}/no-show`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(noShowResponse.body.status).toBe('NO_SHOW');

    // Verify in DB
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    expect(appointment?.status).toBe('NO_SHOW');
  });
});
