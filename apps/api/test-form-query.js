const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const formId = 'cmjkt0d8j000l8o1gi2muggna';
  const orgId = 'cmjknaew900008os8onv4em1l';
  
  console.log('Checking form:', formId);
  console.log('Organization ID:', orgId);
  
  // Vérifier si le formulaire existe
  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: { id: true, name: true, organizationId: true }
  });
  
  console.log('Form found:', form);
  
  // Vérifier avec organizationId
  const formWithOrg = await prisma.form.findFirst({
    where: { id: formId, organizationId: orgId },
    select: { id: true, name: true, organizationId: true }
  });
  
  console.log('Form with org filter:', formWithOrg);
  
  await prisma.$disconnect();
}

test().catch(console.error);
