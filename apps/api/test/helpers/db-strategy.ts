import { execSync } from 'child_process';

export type DbStrategy = 'docker' | 'local';

/**
 * Check if Docker is available and responsive
 * @returns true if Docker is available, false otherwise
 */
export async function isDockerAvailable(): Promise<boolean> {
  try {
    // Check if docker command exists
    execSync('which docker', { stdio: 'ignore' });
    
    // Check if Docker daemon is running
    execSync('docker info', { 
      stdio: 'ignore',
      timeout: 3000, // 3 second timeout
    });
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Resolve the database strategy based on environment variables and Docker availability
 * 
 * Strategy resolution:
 * 1. If E2E_DB_STRATEGY=docker → use docker (testcontainers)
 * 2. If E2E_DB_STRATEGY=local → use local (requires E2E_DATABASE_URL)
 * 3. If E2E_DB_STRATEGY not set or "auto":
 *    - Try Docker first (if available)
 *    - Fallback to local if E2E_DATABASE_URL is set
 *    - Otherwise fail with clear error
 * 
 * @returns The resolved strategy
 * @throws Error if strategy cannot be determined
 */
export async function resolveDbStrategy(): Promise<DbStrategy> {
  const explicitStrategy = process.env.E2E_DB_STRATEGY?.toLowerCase().trim();
  
  // Explicit "docker" strategy
  if (explicitStrategy === 'docker') {
    const dockerAvailable = await isDockerAvailable();
    if (!dockerAvailable) {
      throw new Error(
        'E2E_DB_STRATEGY=docker requires Docker to be installed and running.\n' +
        'Please install Docker Desktop: https://www.docker.com/products/docker-desktop/\n' +
        'Or use E2E_DB_STRATEGY=local with E2E_DATABASE_URL set.'
      );
    }
    return 'docker';
  }
  
  // Explicit "local" strategy
  if (explicitStrategy === 'local') {
    if (!process.env.E2E_DATABASE_URL) {
      throw new Error(
        'E2E_DB_STRATEGY=local requires E2E_DATABASE_URL to be set.\n\n' +
        'Example:\n' +
        '  export E2E_DB_STRATEGY=local\n' +
        '  export E2E_DATABASE_URL=postgresql://user:password@localhost:5432/klozd_test\n\n' +
        'Or use the test:e2e:local script which loads from .env.e2e.local if present.'
      );
    }
    return 'local';
  }
  
  // Auto mode (default) or explicit "auto"
  if (!explicitStrategy || explicitStrategy === 'auto') {
    const dockerAvailable = await isDockerAvailable();
    
    if (dockerAvailable) {
      console.log('ℹ️  Docker detected, using docker strategy (testcontainers)');
      return 'docker';
    }
    
    // Docker not available, try local fallback
    if (process.env.E2E_DATABASE_URL) {
      console.log('ℹ️  Docker not available, using local database from E2E_DATABASE_URL');
      return 'local';
    }
    
    // Neither Docker nor E2E_DATABASE_URL available
    throw new Error(
      'Cannot determine database strategy automatically:\n' +
      '  - Docker is not available\n' +
      '  - E2E_DATABASE_URL is not set\n\n' +
      'Solutions:\n' +
      '  1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/\n' +
      '     Then run: pnpm test:e2e\n\n' +
      '  2. Use local PostgreSQL:\n' +
      '     export E2E_DB_STRATEGY=local\n' +
      '     export E2E_DATABASE_URL=postgresql://user:password@localhost:5432/klozd_test\n' +
      '     pnpm test:e2e\n\n' +
      '  3. Use the convenience script:\n' +
      '     pnpm test:e2e:local\n' +
      '     (loads E2E_DATABASE_URL from .env.e2e.local if present)'
    );
  }
  
  // Invalid strategy value
  throw new Error(
    `Invalid E2E_DB_STRATEGY: "${explicitStrategy}".\n` +
    'Valid values: docker, local, auto (or leave unset for auto)'
  );
}
