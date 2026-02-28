import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (!process.env.NEON_DB) {
  throw new Error('NEON_DB environment variable is missing');
}

const sql = neon(process.env.NEON_DB!);
export const db = drizzle({ client: sql });
