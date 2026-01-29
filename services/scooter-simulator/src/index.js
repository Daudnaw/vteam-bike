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
    lastName: `${n}`,
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
 * @param {number} n
 * @returns {Promise<{email: string, password: string, firstName: string, lastName: string}>}
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
 * @param {object} customer
 * @returns {Promise<string>} token
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
 * Set customer credits.
 *
 * @param {import("mongodb").Db} db
 * @param {string} userId
 * @param {number} credit=1000
 */
async function setUserCredit(db, userId, credit = 1000) {
  const col = db.collection("users");
  return col.findOneAndUpdate({ id: userId }, { $set: { credit } });
}

/**
 * Generate a random scooter (and if rented, a customer) and persist it.
 *
 * @param {object} ctx
 * @param {import("mongodb").Collection} ctx.scootersCol
 * @param {any[]} ctx.cityZones
 * @param {number} ctx.idx
 */
async function generateRandomScooter({ scootersCol, cityZones, idx }) {
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
  let customer;
  try {
    customer = await registerCustomer(idx);
    token = await loginCustomer(customer);
  } catch (err) {
    console.error(`Could not create and login user ${customer}, idx: ${idx}`);
  }

  return {
    scooterId,
    rented: true,
    status: doc.status,
    idx,
    token,
    customerId: customer._id,
  };
}

/**
 * Instantiate a scooter with sensors.
 *
 * @param {object} ctx
 * @param {string} ctx.scooterId
 * @param {number} ctx.battery
 * @param {number} ctx.lat
 * @param {number} ctx.lon
 * @returns {{scooter: Scooter, speedSensor: SpeedSensor, locationSensor: LocationSensor}
 *
 */
function scooterFactory({ scooterId, battery, lat, lon }) {
  const batterySensor = new BatterySensor({ battery });
  const speedSensor = new SpeedSensor({ speedKmh: 0 });
  const locationSensor = new LocationSensor({ lat, lon });
  const scooter = new Scooter({
    id: scooterId,
    url: `ws://backend:3000/ws/scooters`,
    sensors: [batterySensor, speedSensor, locationSensor],
  });

  return { scooter, speedSensor, locationSensor };
}

async function driveLoop({ scooter, locationSensor, speedSensor }) {
  scooter.start();

  while (true) {}
}

/**
 * Create a rental for a given scooter for the user.
 *
 * @param {string} scooterId
 * @param {string} token
 * @return {Promise}
 */
function startRental(scooterId, token) {
  return postJson(
    `${BACKEND_BASE_URL}/api/v1/rentals`,
    { scooter: scooterId },
    { token },
  );
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
      const result = await generateRandomScooter({
        scootersCol,
        cityZones,
        idx: i,
      });
      results.push(result);

      // only scooters that are rented need to call the API to rent
      // and start their drive loop
      if (!result.rented) continue;

      await setUserCredit(db, result.customerId);

      await startRental(result.scooterId, result.token);
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
