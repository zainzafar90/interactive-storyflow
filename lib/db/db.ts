import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is not defined');
}

const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
const db = drizzle(connection);

export { db };
