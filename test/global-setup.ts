import 'dotenv/config';
import { execSync } from 'child_process';
import { buildTestSchemaUrl } from './helpers';

export default async function globalSetup(): Promise<void> {
  const directUrl = process.env.DIRECT_URL;

  if (!directUrl) {
    console.warn('[global-setup] DIRECT_URL not set, skipping schema push');
    return;
  }

  const testUrl = buildTestSchemaUrl(directUrl);

  console.log('[global-setup] Pushing schema to test schema...');

  execSync('npx prisma db push --accept-data-loss', {
    env: { ...process.env, DIRECT_URL: testUrl },
    stdio: 'pipe',
    timeout: 30_000,
  });

  console.log('[global-setup] Schema push complete');
}
