import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { reset } from "drizzle-seed";
import postgres from "postgres";
import { config } from "dotenv";

config({
  path: ".env.local",
});

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

const client = postgres(process.env.POSTGRES_URL, { max: 1 });
const db = drizzle(client);

async function main() {
  await reset(db, schema);

  await db.insert(schema.user).values({
    email: "user@gmail.com",
    password: "$2a$10$3q2ZeN.prCbE/T.ieuxkc.YXWR8Y73X9B.EGi3/mN8LJDoO9QAJZy", // password
  });

  await client.end();
}

main();
