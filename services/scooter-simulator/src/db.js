import { MongoClient } from 'mongodb';
import fs from 'node:fs/promises';
import path from 'node:path';
import { EJSON } from 'bson';

const SEED_DATA_DIR = process.env.SEED_DATA_DIR ?? './data/';

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

/**
 * Seeds the database with base data for the simulation.
 *
 * @param {import("mongodb").Db} db
 * @returns {Promise}
 */
export async function seed(db) {
    const files = (await fs.readdir(SEED_DATA_DIR)).filter((f) =>
        f.endsWith('.json'),
    );

    console.debug(`SEEDING DATABASE FROM ${files.length} FILES`);
    for (const filename of files) {
        console.debug(`Seeding ${filename}`);
        const colName = filename.replace(/\.json$/, '');
        const col = db.collection(colName);

        const filePath = path.join(SEED_DATA_DIR, filename);
        const rawFile = await fs.readFile(filePath, 'utf8');
        // Using data exported with mongodb compass, containing $-prefixed fields.
        // EJSON from bson can parse it. JSON.parse can not.
        const docs = EJSON.parse(rawFile);

        console.debug(`Found ${docs.length} documents`);

        // Clean out the collection before we seed it for the simulation
        await col.deleteMany({});

        await col.insertMany(docs);
    }
}
