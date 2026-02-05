/**
 * @typedef {[number, number]} GeoPoint
 */

import { rand } from "./helpers.js";

/**
 * Random point inside a circle.
 *
 * @param {{ center: GeoPoint, radius: number }} circle
 * @returns {GeoPoint}
 */
export function randomPointInCircle({ center, radius }) {
  const [cx, cy] = center;
  const t = 2 * Math.PI * Math.random();
  const r = radius * Math.sqrt(Math.random());
  return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
}

/**
 * Point in polygon (ray casting).
 *
 * @param {GeoPoint} point
 * @param {GeoPoint[]} polygon
 * @returns {boolean}
 */
export function isPointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersects) inside = !inside;
  }

  return inside;
}

/**
 * Random point inside polygon by rejection sampling in bounding box.
 *
 * @param {GeoPoint[]} polygon
 * @param {number} [maxAttempts=5000]
 * @returns {GeoPoint}
 */
export function randomPointInPolygon(polygon, maxAttempts = 5000) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const [x, y] of polygon) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  for (let i = 0; i < maxAttempts; i++) {
    const p = [rand(minX, maxX), rand(minY, maxY)];
    if (isPointInPolygon(p, polygon)) return p;
  }

  throw new Error("Could not find random point inside polygon");
}
