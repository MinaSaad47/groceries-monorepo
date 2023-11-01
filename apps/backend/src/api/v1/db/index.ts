import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { scheduleJob } from "node-schedule";
import postgres from "postgres";
import log from "../../v1/utils/logger";

import { and, eq, Logger, lte } from "drizzle-orm";
import { format } from "sql-formatter";
import * as schema from "./schema";

const dbUrl: string = process.env.DATABASE_URL!;

export const applyMigrations = async () => {
  log.debug("CHECKING FOR DATABASE MIGRATIONS");
  try {
    const migrationClient = postgres(dbUrl, { max: 1, ssl: "require" });
    await migrate(drizzle(migrationClient), { migrationsFolder: "./drizzle" });
  } catch (err) {
    log.fatal(err);
    process.exit(1);
  }
};

class CustomLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    if (log.level === "trace" && process.env.NODE_ENV === "development") {
      query = format(query, { language: "postgresql", keywordCase: "upper" });
      log.trace(
        `PERFORMING DATABASE CALL
params:
%o
query:
%o`,
        params,
        query
      );
    }
  }
}

export type Database = PostgresJsDatabase<typeof schema>;
export const db = drizzle(postgres(dbUrl, { ssl: "require" }), {
  schema,
  logger: new CustomLogger(),
});

export const scheduleDbJobs = async () => {
  const _job = scheduleJob("*/60 * * * * *", async () => {
    const timestamp = new Date();
    log.info(`running database jobs at ${timestamp.toUTCString()}`);
    const orders = await db
      .update(schema.orders)
      .set({
        status: "expired",
      })
      .where(
        and(
          lte(schema.orders.expiresAt, timestamp),
          eq(schema.orders.status, "pending")
        )
      )
      .returning();
    log.info(`updated ${orders.length} expired orders`);
  });
};
