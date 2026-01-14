import { PrismaClient } from '@prisma/client';

/**
 * Check if database name suggests it's a test database
 */
function isTestDatabase(databaseUrl: string): boolean {
  // Check if database name contains "_test"
  const dbNameMatch = databaseUrl.match(/\/\/(?:[^@]+@)?[^\/]+\/([^?]+)/);
  if (dbNameMatch && dbNameMatch[1]) {
    const dbName = dbNameMatch[1];
    return dbName.includes('_test') || dbName.includes('test');
  }
  return false;
}

/**
 * Check if TRUNCATE mode is safe to use
 */
function canUseTruncate(databaseUrl: string): boolean {
  // If explicitly allowed, use truncate
  if (process.env.E2E_ALLOW_NON_TEST_DB === 'true') {
    return true;
  }
  
  // Otherwise, only allow if database name suggests it's a test database
  return isTestDatabase(databaseUrl);
}

/**
 * Get list of all tables in the database (PostgreSQL-specific)
 */
async function getAllTables(prisma: PrismaClient): Promise<string[]> {
  const result = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `;
  
  return result.map((r) => r.tablename);
}

/**
 * Reset database using TRUNCATE (faster, PostgreSQL-specific)
 */
async function resetDbWithTruncate(prisma: PrismaClient): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL || '';
  
  if (!canUseTruncate(databaseUrl)) {
    throw new Error(
      'TRUNCATE mode is not safe for this database.\n' +
      'Database name must contain "_test" or set E2E_ALLOW_NON_TEST_DB=true.\n' +
      `Current DATABASE_URL: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`
    );
  }
  
  const tables = await getAllTables(prisma);
  
  if (tables.length === 0) {
    console.warn('⚠️  No tables found, skipping TRUNCATE');
    return;
  }
  
  // Build TRUNCATE statement
  const tableList = tables.map((t) => `"${t}"`).join(', ');
  const sql = `TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE;`;
  
  await prisma.$executeRawUnsafe(sql);
}

/**
 * Reset database using deleteMany (slower but safer)
 */
async function resetDbWithDeleteMany(prisma: PrismaClient): Promise<void> {
  // Delete in order to respect foreign key constraints
  await prisma.failedJob.deleteMany();
  await prisma.idempotencyRecord.deleteMany();
  await prisma.authAttempt.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.callParticipant.deleteMany();
  await prisma.call.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.formSubmission.deleteMany();
  await prisma.formAbandon.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.formField.deleteMany();
  await prisma.form.deleteMany();
  await prisma.site.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organizationSettings.deleteMany();
  await prisma.closerSettings.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.calendarConfig.deleteMany();
  await prisma.aIPrediction.deleteMany();
}

/**
 * Reset database by deleting all records
 * 
 * Uses TRUNCATE if:
 * - E2E_RESET_MODE=truncate (or not set, default)
 * - Database name contains "_test" OR E2E_ALLOW_NON_TEST_DB=true
 * 
 * Otherwise falls back to deleteMany for safety.
 */
export async function resetDb(prisma: PrismaClient): Promise<void> {
  // Safety guard: detect parallel workers in local E2E mode
  if (process.env.E2E_DB_STRATEGY === 'local') {
    const workerId = process.env.JEST_WORKER_ID;
    if (workerId && workerId !== '1' && workerId !== undefined) {
      throw new Error(
        'E2E tests in LOCAL strategy must run sequentially (--runInBand or maxWorkers=1).\n' +
        `Detected worker ID: ${workerId}. Multiple workers will cause cross-suite DB resets.\n` +
        'Use: pnpm test:e2e:local (which includes --runInBand)'
      );
    }
  }
  
  const resetMode = process.env.E2E_RESET_MODE?.toLowerCase() || 'truncate';
  
  if (resetMode === 'truncate') {
    try {
      await resetDbWithTruncate(prisma);
      return;
    } catch (error) {
      console.warn('⚠️  TRUNCATE failed, falling back to deleteMany:', error);
      // Fall through to deleteMany
    }
  }
  
  // Use deleteMany as fallback or if explicitly requested
  await resetDbWithDeleteMany(prisma);
}
