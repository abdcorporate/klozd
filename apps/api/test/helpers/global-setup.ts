import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { join } from 'path';
import { writeFileSync, existsSync, readFileSync, unlinkSync } from 'fs';
import { resolveDbStrategy, DbStrategy } from './db-strategy';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let container: any = null;
const STRATEGY_FILE = '/tmp/klozd-e2e-strategy.json';

interface StrategyInfo {
  strategy: DbStrategy;
  connectionString: string;
}

async function setupWithDocker(): Promise<string> {
  console.log('🚀 Starting PostgreSQL test container (Docker)...');
  
  container = await new PostgreSqlContainer('postgres:14')
    .withDatabase('klozd_test')
    .withUsername('test')
    .withPassword('test')
    .start();

  const connectionString = container.getConnectionUri();
  console.log(`✅ PostgreSQL container started: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);
  
  return connectionString;
}

async function setupWithLocal(): Promise<string> {
  const databaseUrl = process.env.E2E_DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('E2E_DATABASE_URL is required when using local strategy');
  }
  
  console.log('📦 Using local PostgreSQL database...');
  console.log(`   Database: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`); // Hide password
  
  // Verify connection by running a simple query
  try {
    execSync('pnpm prisma db execute --stdin', {
      cwd: join(__dirname, '../..'),
      input: 'SELECT 1;',
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
      stdio: 'ignore',
    });
  } catch (error) {
    console.warn('⚠️  Could not verify database connection, continuing anyway...');
  }
  
  return databaseUrl;
}

async function runMigrations(connectionString: string, strategy: DbStrategy): Promise<void> {
  console.log('📦 Setting up database schema...');
  
  try {
    // Generate Prisma client first
    execSync('pnpm prisma generate', {
      cwd: join(__dirname, '../..'),
      env: {
        ...process.env,
        DATABASE_URL: connectionString,
      },
      stdio: 'inherit',
    });

    if (strategy === 'local') {
      // For local strategy, use db push to sync schema (more flexible for test DBs)
      console.log('📦 Syncing schema with prisma db push...');
      execSync('pnpm prisma db push --accept-data-loss', {
        cwd: join(__dirname, '../..'),
        env: {
          ...process.env,
          DATABASE_URL: connectionString,
        },
        stdio: 'inherit',
      });
      console.log('✅ Schema synced');
      
      // Mark all migrations as applied to avoid migration conflicts
      const migrations = [
        '20260114201634_add_pagination_indexes',
        '20260114210000_add_auth_attempt_and_idempotency',
        '20260115000000_add_failed_job_table',
      ];
      
      for (const migration of migrations) {
        try {
          execSync(`pnpm prisma migrate resolve --applied ${migration}`, {
            cwd: join(__dirname, '../..'),
            env: {
              ...process.env,
              DATABASE_URL: connectionString,
            },
            stdio: 'ignore',
          });
        } catch (error) {
          // Migration might already be marked as applied, ignore
        }
      }
    } else {
      // For docker strategy, use migrate deploy (clean container)
      console.log('📦 Running Prisma migrations...');
      execSync('pnpm prisma migrate deploy', {
        cwd: join(__dirname, '../..'),
        env: {
          ...process.env,
          DATABASE_URL: connectionString,
        },
        stdio: 'inherit',
      });
      console.log('✅ Migrations applied');
    }
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}

async function globalSetup() {
  const strategy = await resolveDbStrategy();
  
  let connectionString: string;
  
  if (strategy === 'docker') {
    connectionString = await setupWithDocker();
  } else {
    connectionString = await setupWithLocal();
  }
  
  // Set DATABASE_URL for Prisma
  process.env.DATABASE_URL = connectionString;
  
  // Run migrations
  await runMigrations(connectionString, strategy);
  
  // Store strategy info for teardown
  const strategyInfo: StrategyInfo = {
    strategy,
    connectionString,
  };
  writeFileSync(STRATEGY_FILE, JSON.stringify(strategyInfo, null, 2));
  
  console.log(`✅ Test database ready (strategy: ${strategy})`);
}

async function globalTeardown() {
  // Read strategy info
  let strategy: DbStrategy = 'docker';
  
  if (existsSync(STRATEGY_FILE)) {
    try {
      const strategyInfo: StrategyInfo = JSON.parse(
        readFileSync(STRATEGY_FILE, 'utf-8')
      );
      strategy = strategyInfo.strategy;
    } catch (error) {
      console.warn('⚠️  Could not read strategy file, assuming docker');
    }
  }
  
  if (strategy === 'docker' && container) {
    console.log('🛑 Stopping PostgreSQL container...');
    await container.stop();
    console.log('✅ Container stopped');
  } else if (strategy === 'local') {
    console.log('ℹ️  Local database mode: no cleanup needed');
  }
  
  // Clean up strategy file
  if (existsSync(STRATEGY_FILE)) {
    unlinkSync(STRATEGY_FILE);
  }
}

export default globalSetup;
export { globalTeardown };
