import { connect as connectMongo } from "./db.js";
import { randomPointInCircle, randomPointInPolygon } from "./geo-point.js";
import { rand, clamp, pick } from "./helpers.js";
import {
  Scooter,
  LocationSensor,
  BatterySensor,
  SpeedSensor,
} from "@vteam/scooter-logic";
import crypto from "node:crypto";

const NUMBER_OF_SCOOTERS = Number(process.env.NUMBER_OF_SCOOTERS);
const MONGODB_DSN = process.env.MONGODB_DSN;
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL ?? "http://backend:3000";

if (!MONGODB_DSN) throw new Error("Missing env var MONGODB_DSN");
if (!NUMBER_OF_SCOOTERS) throw new Error("Missing env var NUMBER_OF_SCOOTERS");

/**
 * Pick a battery percentage in [5..100].
 */
function randomBattery() {
  return clamp(Math.round(rand(5, 100)), 5, 100);
}

/**
 * Randomly decide if the scooter should start out rented.
 */
function decideRented() {
  return Math.random() < 0.5;
}

/**
 * Weighted status for non-rented scooters:
 * - 80% available
 * - 15% charging
 * - 5% maintenance
 */
function pickNonRentedStatus() {
  const r = Math.random();
  if (r < 0.8) return "available";
  if (r < 0.95) return "charging";
  return "maintenance";
}

/**
 * Create a customer payload for the backend.
 */
function createCustomer(n) {
  return {
    firstName: "Kund",
    lastName: String(n),
    email: `${crypto.randomUUID()}@example.com`,
    password: "password",
  };
}

/**
 * Pick a random coordinate inside the provided city zone.
 *
 * @param {any} zone
 * @returns {[number, number]} [lat, lon]
 */
function randomCoordinateInZone(zone) {
  if (zone.type === "circle") {
    return randomPointInCircle({ center: zone.center, radius: zone.radius });
  }
  if (zone.type === "polygon") {
    return randomPointInPolygon(zone.area);
  }

  throw new Error(`Unsupported zone.type: ${zone.type}`);
}

/**
 * Create the MongoDB scooter document for initial insert.
 *
 * @param {object} input
 * @param {number} input.battery
 * @param {number} input.lat
 * @param {number} input.lon
 * @param {boolean} input.rented
 */
function createScooterDoc({ battery, lat, lon, rented }) {
  const status = rented ? "rented" : pickNonRentedStatus();
  const timestamp = new Date();

  return {
    battery,
    lat,
    lon,
    speedKmh: 0,
    status,
    lastSeenAt: rented ? timestamp : null,
    updatedAt: timestamp,
    createdAt: timestamp,
  };
}

/**
 * Register a customer.
 *
 * @param {Number} n
 * @returns {Promise<{email: String, password: String, firstName: String, lastName: String}>}
 */
async function registerCustomer(n) {
  console.debug("Creating customer");
  const customer = createCustomer(n);
  console.debug({ customer });

  await postJson(`${BACKEND_BASE_URL}/api/auth/register`, customer);

  return customer;
}

/**
 * Login a customer. Returns a token.
 *
 * @param {Object} customer
 * @returns {Promise<String>} token
 */
async function loginCustomer(customer) {
  const login = await postJson(`${BACKEND_BASE_URL}/api/auth/login`, {
    email: customer.email,
    password: customer.password,
  });

  const token = login?.token;

  return token;
}

/**
 * Create a scooter (and if rented, a customer) and persist it.
 *
 * @param {object} ctx
 * @param {import("mongodb").Collection} ctx.scootersCol
 * @param {any[]} ctx.cityZones
 * @param {number} ctx.idx
 */
async function createOneScooter({ scootersCol, cityZones, idx }) {
  const zone = pick(cityZones);
  const [lat, lon] = randomCoordinateInZone(zone);

  const battery = randomBattery();
  const rented = decideRented();

  const doc = createScooterDoc({ battery, lat, lon, rented });

  const result = await scootersCol.insertOne(doc);
  const scooterId = result.insertedId.toString();

  if (!rented) {
    return { scooterId, rented: false, status: doc.status };
  }

  let token;
  try {
    const customer = await registerCustomer(idx);
    token = await loginCustomer(customer);
  } catch (err) {
    console.error(`Could not create and login user ${customer}, idx: ${idx}`);
  }

  return { scooterId, rented: true, status: doc.status, idx, token };
}

async function main() {
  console.debug("Connecting to database");
  const { client, db } = await connectMongo(MONGODB_DSN);
  console.debug("Connected successfully to database");

  try {
    const scootersCol = db.collection("scooters");
    const zonesCol = db.collection("zones");

    console.debug("Fetching available cities");
    const cityZones = await zonesCol.find({ zoneType: "city" }).toArray();

    if (cityZones.length === 0) {
      throw new Error('No zones found where zoneType = "city"');
    }

    console.debug(`Found ${cityZones.length} cities`);

    const results = [];

    for (let i = 1; i <= NUMBER_OF_SCOOTERS; i++) {
      console.debug(`Creating scooter ${i}/${NUMBER_OF_SCOOTERS}`);
      const result = await createOneScooter({
        scootersCol,
        cityZones,
        idx: i,
      });
      results.push(result);
    }

    console.log(
      JSON.stringify(
        {
          created: results.length,
          rented: results.filter((r) => r.rented).length,
          available: results.filter((r) => r.status === "available").length,
          charging: results.filter((r) => r.status === "charging").length,
          maintenance: results.filter((r) => r.status === "maintenance").length,
          sample: results.slice(0, 5),
        },
        null,
        2,
      ),
    );
  } finally {
    await client.close();
  }
}

/**
 * POST JSON and parse JSON response.
 *
 * @param {string} url
 * @param {object} body
 * @param {{ token?: string }} [opts]
 * @returns {Promise<any>}
 */
async function postJson(url, body, opts = {}) {
  const headers = { "content-type": "application/json" };
  if (opts.token) headers.authorization = `Bearer ${opts.token}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // keep null
  }

  if (!res.ok) {
    const msg = json?.message || json?.error || text || `HTTP ${res.status}`;
    throw new Error(`POST ${url} failed: ${msg}`);
  }

  return json;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
