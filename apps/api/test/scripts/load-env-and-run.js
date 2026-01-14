#!/usr/bin/env node

/**
 * Simple script to load .env.e2e.local and run jest
 * Usage: node test/scripts/load-env-and-run.js [jest-args...]
 */

const { readFileSync, existsSync } = require('fs');
const { join } = require('path');
const { spawn } = require('child_process');

const envFile = join(__dirname, '../../.env.e2e.local');

if (existsSync(envFile)) {
  const content = readFileSync(envFile, 'utf-8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '');
      process.env[key.trim()] = cleanValue;
    }
  }
  
  console.log(`✅ Loaded environment from .env.e2e.local`);
} else {
  console.warn(`⚠️  .env.e2e.local not found, using environment variables`);
}

// Ensure E2E_DB_STRATEGY is set to local
if (!process.env.E2E_DB_STRATEGY) {
  process.env.E2E_DB_STRATEGY = 'local';
}

// Run jest with remaining args
// Force sequential execution for local E2E tests (shared DB)
const jestArgs = process.argv.slice(2);
const jestPath = require.resolve('jest/bin/jest');
const jestProcess = spawn('node', [jestPath, '--config', './test/jest-e2e.json', '--runInBand', ...jestArgs], {
  stdio: 'inherit',
  env: process.env,
});

jestProcess.on('exit', (code) => {
  process.exit(code || 0);
});
