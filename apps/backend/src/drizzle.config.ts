import type { Config } from "drizzle-kit";
import dotenv from "dotenv";
dotenv.config();

export default {
  schema: "./src/api/v1/db/schema.ts",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL as string,
    ssl: true,
  },
  out: "./drizzle",
} satisfies Config;
