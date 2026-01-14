import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp, resetDb } from '../helpers/app';
import { PrismaService } from '../../src/prisma/prisma.service';
import { registerAndVerifyAndLogin } from '../helpers/auth';
import { createForm, buildPublicSubmissionPayload } from '../helpers/factories';
import * as bcrypt from 'bcrypt';
import { expect } from '@jest/globals';

describe('Form Submit Creates Lead (e2e)', () => {
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

  it('should create a lead when submitting a public form', async () => {
    // Create org + admin user
    const auth = await registerAndVerifyAndLogin(httpServer, prisma);
    const { token, user, organization } = auth;

    // Create a form via authenticated endpoint
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
    expect(form).toHaveProperty('id');
    expect(form.organizationId).toBe(organization.id);
    expect(form.status).toBe('ACTIVE');

    // Submit form publicly
    const submissionPayload = buildPublicSubmissionPayload(form);
    const submitResponse = await request(httpServer)
      .post(`/leads/forms/${form.id}/submit`)
      .send(submissionPayload)
      .expect(200);

    // Response should contain lead or submission info
    expect(submitResponse.body).toBeDefined();
    expect(submitResponse.body).toHaveProperty('success', true);

    // Verify lead was created in DB
    const lead = await prisma.lead.findFirst({
      where: {
        email: submissionPayload.email,
        organizationId: organization.id,
      },
    });

    expect(lead).toBeDefined();
    expect(lead?.email).toBe(submissionPayload.email);
    expect(lead?.firstName).toBe(submissionPayload.firstName);
    expect(lead?.lastName).toBe(submissionPayload.lastName);
    expect(lead?.organizationId).toBe(organization.id);
  });

  it('should respect organization scoping - leads from different orgs should not be visible', async () => {
    // Create first org + admin
    const auth1 = await registerAndVerifyAndLogin(
      httpServer,
      prisma,
      `org1-${Date.now()}@example.com`,
    );
    const { token: token1, organization: org1 } = auth1;

    // Create second org + admin
    const auth2 = await registerAndVerifyAndLogin(
      httpServer,
      prisma,
      `org2-${Date.now()}@example.com`,
    );
    const { token: token2, organization: org2 } = auth2;

    // Create form in org1
    const formResponse = await request(httpServer)
      .post('/forms')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        name: 'Org1 Form',
        slug: `org1-form-${Date.now()}`,
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

    // Submit form publicly (creates lead in org1)
    const submissionPayload = buildPublicSubmissionPayload(form);
    await request(httpServer)
      .post(`/leads/forms/${form.id}/submit`)
      .send(submissionPayload)
      .expect(200);

    // Create a lead directly in org2 via Prisma
    const lead2 = await prisma.lead.create({
      data: {
        email: `org2-${Date.now()}@example.com`,
        firstName: 'Org2',
        lastName: 'Lead',
        organizationId: org2.id,
        status: 'NEW',
      },
    });

    // Org1 admin should only see org1 leads
    const leadsResponse1 = await request(httpServer)
      .get('/leads')
      .set('Authorization', `Bearer ${token1}`)
      .query({ limit: 10 })
      .expect(200);

    const org1Leads = leadsResponse1.body.items;
    expect(org1Leads.length).toBeGreaterThan(0);
    expect(org1Leads.every((lead: any) => lead.organizationId === org1.id)).toBe(true);
    expect(org1Leads.find((lead: any) => lead.id === lead2.id)).toBeUndefined();

    // Org2 admin should only see org2 leads
    const leadsResponse2 = await request(httpServer)
      .get('/leads')
      .set('Authorization', `Bearer ${token2}`)
      .query({ limit: 10 })
      .expect(200);

    const org2Leads = leadsResponse2.body.items;
    expect(org2Leads.length).toBeGreaterThan(0);
    expect(org2Leads.every((lead: any) => lead.organizationId === org2.id)).toBe(true);
    expect(org2Leads.find((lead: any) => lead.id === lead2.id)).toBeDefined();
  });
});
