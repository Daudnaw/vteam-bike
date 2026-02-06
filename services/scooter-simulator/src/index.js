import { connect as connectMongo, seed } from './db.js';
import { randomPointInCircle, randomPointInPolygon } from './geo-point.js';
import { rand, clamp, pick, sleep } from './helpers.js';
import {
    Scooter,
    LocationSensor,
    BatterySensor,
    SpeedSensor,
} from '@vteam/scooter-logic';
import crypto from 'node:crypto';
import { once } from 'node:events';

const NUMBER_OF_SCOOTERS = Number(process.env.NUMBER_OF_SCOOTERS);
const MONGODB_DSN = process.env.MONGODB_DSN;
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL ?? 'http://backend:3000';

if (!MONGODB_DSN) throw new Error('Missing env var MONGODB_DSN');
if (!NUMBER_OF_SCOOTERS) throw new Error('Missing env var NUMBER_OF_SCOOTERS');

/**
 * Pick a battery percentage in [5..100].
 */
function randomBattery() {
    return clamp(Math.round(rand(5, 100)), 5, 100);
}

/**
 * Pick a random speed for rented bikes to drive around in [15..45]
 */
function randomSpeed() {
    return clamp(Math.round(rand(15, 45)), 15, 45);
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
    if (r < 0.8) return 'available';
    if (r < 0.95) return 'charging';
    return 'maintenance';
}

/**
 * Create a customer payload for the backend.
 */
function createCustomer(n) {
    return {
        firstName: 'Kund',
        lastName: `${n}`,
        email: `${crypto.randomUUID()}@example.com`,
        password: 'password',
    };
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
    // this may seem counter-intuitive to set the status to available, but its
    // to allow us to go through the rentals API to rent the scooter, to fully
    // use the system
    const status = rented ? 'available' : pickNonRentedStatus();
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
    const customer = createCustomer(n);

    const customerDoc = await postJson(
        `${BACKEND_BASE_URL}/api/auth/register`,
        customer,
    );

    return { customerDoc, customer };
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
    // console.debug(`Giving the renting user ${credit} credit`);
    const col = db.collection('users');
    // console.debug("Updating user");
    return col.findOneAndUpdate({ id: userId }, { $set: { credit } });
}

/**
 * Generate a random scooter (and if rented, a customer) and persist it.
 *
 * @param {object} ctx
 * @param {import("mongodb").Collection} ctx.scootersCol
 * @param {any[]} ctx.routes
 * @param {number} ctx.idx
 */
async function generateRandomScooter({ scootersCol, routes, idx }) {
    const route = pick(routes); // get a random route
    const [lon, lat] = route.route[0]; // the starting point

    const battery = randomBattery();
    const rented = decideRented();

    const doc = createScooterDoc({ battery, lat, lon, rented });

    const result = await scootersCol.insertOne(doc);
    const scooterId = result.insertedId.toString();

    if (!rented) {
        return {
            scooter: {
                id: scooterId,
                battery,
                lat,
                lon,
            },
            route,
            rented: false,
            status: doc.status,
        };
    }

    const speedKmh = randomSpeed();

    let token, customer, customerDoc;
    try {
        // console.debug("Registering user");
        ({ customer, customerDoc } = await registerCustomer(idx));
        // console.debug("User registered. Logging in user");
        token = await loginCustomer(customer);
        // console.debug("User logged in");
    } catch (err) {
        console.error(
            `Could not create and login user, idx: ${idx}`,
            customer,
            customerDoc,
            token,
        );
    }

    return {
        scooter: {
            id: scooterId,
            battery,
            lat,
            lon,
            speedKmh,
        },
        rented: true,
        status: doc.status,
        idx,
        token,
        route,
        customerId: customerDoc._id,
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
    console.debug('Instantiate a scooter', { scooterId, battery, lat, lon });
    const batterySensor = new BatterySensor({ battery });
    const speedSensor = new SpeedSensor({ speedKmh: 0 });
    const locationSensor = new LocationSensor({ lat, lon });
    const scooter = new Scooter({
        id: scooterId,
        url: `ws://backend:3000/ws/scooters`,
        sensors: [batterySensor, speedSensor, locationSensor],
    });

    // console.debug("Scooter instantiated", scooter);
    return { scooter, speedSensor, locationSensor };
}

/**
 * Simulates a scooter driving along a given path at a given speed.
 * The path is walked by distance, not by "one point per tick", so it works
 * even if points are unevenly spaced.
 *
 * @param {object} ctx
 * @param {Scooter} ctx.scooter
 * @param {LocationSensor} ctx.locationSensor
 * @param {SpeedSensor} ctx.speedSensor
 * @param {Array<number, number>} ctx.route
 * @param {number} [ctx.tickMs=1000]
 *
 * @returns {Promise}
 */
async function driveLoop({
    scooter,
    locationSensor,
    speedSensor,
    route,
    tickMs = 1000,
}) {
    const { speedKmh } = speedSensor.getState();
    const speedMps = (Math.max(speedKmh, 0) * 1000) / 3600;

    const path = route?.route;

    if (!Array.isArray(path) || path.length < 2) {
        throw new Error('Path must exist andh ave at least two points');
    }

    // Precompute segment lengths for stable stepping
    const segmentLengths = new Array(path.length - 1);
    for (let i = 0; i < path.length - 1; i++) {
        segmentLengths[i] = haversineMeters(path[i], path[i + 1]);
    }

    let segmentIdx = 0;
    let segmentProgressMeters = 0;

    while (segmentIdx < segmentLengths.length) {
        console.log(`Driving ${segmentIdx} at ${speedMps}mps`);

        // If speed is 0, just idle but keep ticking.
        if (speedMps === 0) {
            await sleep(tickMs);
            continue;
        }

        let remainingMeters = speedMps * (tickMs / 1000);

        // Advance along segments by distance
        while (remainingMeters > 0 && segmentIdx < segmentLengths.length) {
            const currentSegmentLength = segmentLengths[segmentIdx];

            // Handle duplicate points
            if (currentSegmentLength === 0) {
                segmentIdx += 1;
                segmentProgressMeters = 0;
                continue;
            }

            const leftInSegment = currentSegmentLength - segmentProgressMeters;

            if (remainingMeters < leftInSegment) {
                segmentProgressMeters += remainingMeters;
                remainingMeters = 0;
            } else {
                remainingMeters -= leftInSegment;
                segmentIdx += 1;
                segmentProgressMeters = 0;
            }
        }

        // Update sensor location to current interpolated position
        if (segmentIdx >= segmentLengths.length) break;

        const currentSegmentLength = segmentLengths[segmentIdx] || 1;
        const t =
            currentSegmentLength === 0
                ? 1
                : segmentProgressMeters / currentSegmentLength;

        const [lon, lat] = linearInterpolation(
            path[segmentIdx],
            path[segmentIdx + 1],
            t,
        );
        locationSensor.set(lat, lon);

        await sleep(tickMs);
    }

    // Ensure we end exactly at the last point
    const [endLon, endLat] = path[path.length - 1];
    locationSensor.set(endLat, endLon);
    speedSensor.set(0);
}

/**
 * Compute great-circle distance between two [lon, lat] points in meters.
 * This is used in navigation. The source is an interesting read.
 * Function is obtained from https://www.movable-type.co.uk/scripts/latlong.html
 *
 * @param {[number, number]} a
 * @param {[number, number]} b
 * @returns {number}
 */
function haversineMeters([lon1, lat1], [lon2, lat2]) {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres

    return d;
}

/**
 * Linear interpolation between two [lon, lat] points.
 *
 * @param {[number, number]} a
 * @param {[number, number]} b
 * @param {number} t 0..1
 * @returns {[number, number]}
 */
function linearInterpolation([lon1, lat1], [lon2, lat2], t) {
    return [lon1 + (lon2 - lon1) * t, lat1 + (lat2 - lat1) * t];
}

/**
 * Create a rental for a given scooter for the user.
 *
 * @param {string} scooterId
 * @param {string} token
 * @returns {Promise}
 */
function startRental(scooterId, token) {
    console.debug(`Starting rental of scooter ${scooterId}`);
    return postJson(
        `${BACKEND_BASE_URL}/api/v1/rentals`,
        { scooter: scooterId },
        { token },
    );
}

/**
 * End a rental for a given scooter.
 *
 * @param {string} rentalId
 * @param {string} token
 * @returns {Promise<string>}
 */
async function endRental(rentalId, token) {
    console.debug(`Ending rental ${rentalId}`);
    const res = await fetch(
        `${BACKEND_BASE_URL}/api/v1/rentals/${rentalId}/end`,
        {
            method: 'PATCH',
            headers: {
                authorization: `Bearer ${token}`,
                'content-type': 'application/json',
            },
        },
    );

    return res.ok;
}

async function main() {
    console.debug('Connecting to database');
    const { client, db } = await connectMongo(MONGODB_DSN);
    console.debug('Connected successfully to database');

    try {
        await seed(db);
    } catch (err) {
        console.error(err);
        throw new Error('Failed to seed database');
    }

    try {
        const scootersCol = db.collection('scooters');
        const routesCol = db.collection('simulation_routes');

        console.debug('Fetching available routes');
        const routes = await routesCol.find({}).toArray();
        console.debug(`Found ${routes.length} routes`);

        if (routes.length === 0) {
            throw new Error('No routes found');
        }

        const results = [];

        for (let i = 1; i <= NUMBER_OF_SCOOTERS; i++) {
            console.debug(`Creating scooter ${i}/${NUMBER_OF_SCOOTERS}`);
            let rental;
            const result = await generateRandomScooter({
                scootersCol,
                routes,
                idx: i,
            });
            results.push(result);

            // console.debug({ result });

            const { scooter, speedSensor, locationSensor } = scooterFactory({
                scooterId: result.scooter.id,
                battery: result.scooter.battery,
                lat: result.scooter.lat,
                lon: result.scooter.lon,
            });

            // Make sure the scooter has connected to the websocket,
            // by awaiting a promise that resolves when we reach that state. This was done to avoid a race
            // condition. Listening to the `READY` event resulted in a race condition.
            // await scooter.isReady();
            await once(scooter, 'READY');

            // When the scooter starts, happens when the rental step is completed,
            // it starts its drive loop
            // NOTE: Attaching this listener on "AVAILABLE" scooters as well will allow us to start them
            // from the webapp and have them follow a simulated route
            scooter.once('START', async () => {
                speedSensor.set(result.scooter.speedKmh);
                await driveLoop({
                    scooter,
                    speedSensor,
                    locationSensor,
                    route: result.route,
                });

                const rentalEnded = await endRental(rental._id);
            });

            // only scooters that are rented need to call the API to rent
            // and start their drive loop
            if (!result.rented) continue;

            await setUserCredit(db, result.customerId);
            rental = await startRental(result.scooter.id, result.token);
            console.log({ rental });
        }

        console.log(
            JSON.stringify(
                {
                    created: results.length,
                    rented: results.filter((r) => r.rented).length,
                    available: results.filter(
                        (r) => r.status === 'available' && !r.rented,
                    ).length,
                    charging: results.filter((r) => r.status === 'charging')
                        .length,
                    maintenance: results.filter(
                        (r) => r.status === 'maintenance',
                    ).length,
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
    const headers = { 'content-type': 'application/json' };
    if (opts.token) headers.authorization = `Bearer ${opts.token}`;

    const res = await fetch(url, {
        method: 'POST',
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
        const msg =
            json?.message || json?.error || text || `HTTP ${res.status}`;
        throw new Error(`POST ${url} failed: ${msg}`);
    }

    return json;
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
