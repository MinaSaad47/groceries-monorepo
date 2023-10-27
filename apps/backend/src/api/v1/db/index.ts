import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import log from "../../v1/utils/logger";

import { Logger } from "drizzle-orm";
import { format } from "sql-formatter";
import * as schema from "./schema";

import "pg";

declare module "pg" {
  interface Pool {
    transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
  }
}

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
