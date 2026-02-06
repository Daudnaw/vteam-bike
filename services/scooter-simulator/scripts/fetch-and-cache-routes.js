#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { EJSON } from "bson";
import { randomPointInCircle, randomPointInPolygon } from "../src/geo-point.js";
import { sleep } from "../src/helpers.js";

// ESModules don't have these conveniece constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const N = process.env.NUMBER_OF_ROUTES ?? 1;

const routesToCache = [];
/**
 * Read the zones seed and filter on cities.
 *
 * @returns {Promise<Array<object>>}
 */
async function getCities() {
  const zonesPath = path.resolve(__dirname, "../data/zones.json");
  const zonesData = await readFile(zonesPath, "utf8");
  const zones = EJSON.parse(zonesData);

  return zones.filter((z) => z.zoneType === "city");
}

/**
 * Call the demo server for open street maps routing service
 * to get a route between two points. We're using this as it's
 * a free and open API. However no more than 1 req per sec is allowed.
 *
 * @see {https://project-osrm.org/docs/v5.24.0/api/#requests}
 * @param {object} ctx
 * @param {[number, number]} ctx.startPoint
 * @param {[number, number]} ctx.endPoint
 * @returns {Promise<Array<[number, number]>>}
 */
async function getRoute({ startPoint, endPoint, profile = "bike" }) {
  const [startLat, startLon] = startPoint;
  const [endLat, endLon] = endPoint;

  const url =
    `https://router.project-osrm.org/route/v1/${profile}/` +
    `${startLon},${startLat};${endLon},${endLat}` +
    `?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM route failed: HTTP ${res.status}`);

  const json = await res.json();

  const coords = json?.routes?.[0]?.geometry?.coordinates;

  if (!Array.isArray(coords) || coords.length < 2)
    throw new Error("OSRM returned no coordinates");

  // We are using [lat, lon] on our end, but the route comes as [lon, lat],
  // keep that in mind
  return coords;
}

async function main() {
  const cities = await getCities();

  for (const city of cities) {
    for (let i = 1; i <= N; i++) {
      const startPoint =
        city.type === "polygon"
          ? randomPointInPolygon(city.area)
          : randomPointInCircle({ center: city.center, radius: city.radius });

      const endPoint =
        city.type === "polygon"
          ? randomPointInPolygon(city.area)
          : randomPointInCircle({ center: city.center, radius: city.radius });

      console.log(`City: ${city.name} | Route: ${i}/${N}`);
      const route = await getRoute({ startPoint, endPoint });

      routesToCache.push({
        start: [startPoint[1], startPoint[0]],
        end: [endPoint[1], endPoint[0]],
        route,
      });

      // Make sure we don't make more than 1 req per second, to keep
      // the fair usage policy of the demo server
      await sleep(1050);
    }
  }

  const outPath = path.resolve(__dirname, "../data/simulation_routes.json");
  await writeFile(outPath, JSON.stringify(routesToCache), "utf8");

  console.log(`Wrote ${routesToCache.length} routes to ${outPath}`);
}

await main();
