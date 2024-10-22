import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

import * as schema from './schema';

config({ path: '.env' });
const connectionString = process.env.SUPABASE_URL!;
// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false })

export const db = drizzle(client, { schema });
