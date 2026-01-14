import { PrismaClient } from '@prisma/client';

/**
 * Create a minimal valid form with 1-2 fields
 * By default, creates an ACTIVE form (publicly submittable)
 */
export async function createForm(
  prisma: PrismaClient,
  organizationId: string,
  createdById: string,
  name: string = 'Test Form',
  slug: string = `test-form-${Date.now()}`,
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED' = 'ACTIVE',
) {
  return prisma.form.create({
    data: {
      name,
      slug,
      status,
      organizationId,
      createdById,
      formFields: {
        create: [
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
      },
    },
    include: {
      formFields: true,
    },
  });
}

/**
 * Build minimal payload for POST /leads/forms/:formId/submit
 */
export function buildPublicSubmissionPayload(form: any, overrides: any = {}) {
  // form.fields or form.formFields depending on how it's returned
  const fields = form.fields || form.formFields || [];
  return {
    email: `test-${Date.now()}@example.com`,
    firstName: 'John',
    lastName: 'Doe',
    phone: '+33612345678',
    data: fields.length >= 2 ? {
      [fields[0].id]: 'John Doe',
      [fields[1].id]: `test-${Date.now()}@example.com`,
    } : {},
    ...overrides,
  };
}

/**
 * Build minimal payload for POST /scheduling/appointments/public
 */
export function buildPublicBookingPayload(
  leadId: string,
  assignedCloserId: string,
  scheduledAt: Date,
  duration: number = 30,
  overrides: any = {},
) {
  return {
    leadId,
    assignedCloserId,
    scheduledAt: scheduledAt.toISOString(),
    duration,
    ...overrides,
  };
}
