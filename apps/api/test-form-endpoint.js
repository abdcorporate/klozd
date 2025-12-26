const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFormQuery() {
  const formId = 'cmjko0qhd00018opcawbmh13r';
  const orgId = 'cmjknaew900008os8onv4em1l';
  
  console.log('Testing form query...');
  console.log('Form ID:', formId);
  console.log('Organization ID:', orgId);
  console.log('');
  
  // Test 1: findUnique sans filtre
  const form1 = await prisma.form.findUnique({
    where: { id: formId },
    select: { id: true, name: true, organizationId: true },
  });
  console.log('1. findUnique (sans filtre):', form1);
  
  // Test 2: findUnique avec include
  const form2 = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      formFields: {
        orderBy: { order: 'asc' },
      },
    },
  });
  console.log('2. findUnique (avec include):', form2 ? `Found: ${form2.name}, org: ${form2.organizationId}` : 'NOT FOUND');
  
  // Test 3: Vérifier l'organisation
  if (form1) {
    console.log('3. Organization match:', form1.organizationId === orgId ? 'YES' : 'NO');
    console.log('   Form org:', form1.organizationId);
    console.log('   User org:', orgId);
  }
  
  await prisma.$disconnect();
}

testFormQuery().catch(console.error);

