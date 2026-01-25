import User from "../users/model.js";
import Zone from "../zones/model.js";

export default async function handelPrice(rental) {
  if (!rental?.startTime || !rental?.endTime) {
    throw new Error("Rental must have startTime and endTime");
  }
  const minutes = Math.ceil((rental.endTime - rental.startTime) / 60000);
  
  const user = await User.findById(rental.user);
  if (!user) throw new Error("User not found");

  const tier = await getMembershipTier(user);

  const startFee = 10;
  const pricePerMinute = 2;

  let cost = minutes * pricePerMinute;

  if (tier === "medium") cost = Math.round(cost * 0.5);
  if (tier === "small") cost = Math.round(cost * 0.9);

  const parkingResult = await parking(rental);
  if (!parkingResult.ok) {
    cost += startFee;
  }

  if (tier === "allin") cost = 0;

  return { cost,
    minutes,
    tier,
    parking: parkingResult
  };
}

async function getMembershipTier(user) {
  const m = user?.membership;
  if (!m || m.status !== "active") return null;

  if (m.tier === "allin" || m.tier === "medium" || m.tier === "small") {
    return m.tier;
  }
  return null;
}

async function parking(rental) {
  if (!rental?.tripHistory?.length) {
    return { ok: false, reason: "no_trip_history" };
  }

  const parkingPoint = rental.tripHistory[rental.tripHistory.length - 1];

  const zones = await Zone.find({ zoneType: "parking", active: true }).lean();

  for (const zone of zones) {
    if (zone.type === "polygon" && Array.isArray(zone.area)) {
      if (pointInPolygon(parkingPoint, zone.area)) {
        return { ok: true, zoneId: String(zone._id), zoneName: zone.name };
      }
    }

    if (zone.type === "circle" && Array.isArray(zone.center) && zone.radius != null) {
      if (pointInCircle(parkingPoint, zone.center, zone.radius)) {
        return { ok: true, zoneId: String(zone._id), zoneName: zone.name };
      }
    }
  }

  return { ok: false, reason: "outside_parking_zone" };
}

function pointInPolygon(point, polygon) {
  const x = point.lng;
  const y = point.lat;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect =
      (yi > y) !== (yj > y) &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInCircle(point, center, radiusMeters) {
  const [centerLng, centerLat] = center;
  const dist = distanceMeters(point.lat, point.lng, centerLat, centerLng);
  return dist <= Number(radiusMeters);
}

function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}