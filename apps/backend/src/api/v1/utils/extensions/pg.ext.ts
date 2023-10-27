import { Pool, PoolClient } from "pg";

Pool.prototype.transaction = async function <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await this.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
