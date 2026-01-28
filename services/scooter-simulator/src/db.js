import { MongoClient } from "mongodb";

/**
 * Connect to MongoDB and return { client, db }.
 *
 * @param {string} dsn
 * @returns {Promise<{ client: MongoClient, db: import("mongodb").Db }>}
 */
export async function connect(dsn) {
  const client = new MongoClient(dsn);
  await client.connect();
  return { client, db: client.db() };
}
