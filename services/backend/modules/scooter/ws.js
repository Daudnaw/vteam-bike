import createDebug from "debug";
import { WebSocketServer } from "ws";
import Scooter from "./model.js";

const DEFAULT_TELEMETRY = {
  activeIntervalMs: 5000,
  idleIntervalMs: 60000,
};

const debug = createDebug("backend:websockets:scooters");

/**
 * In-memory "room" cache.
 *
 * Key: scooter id string.
 * Value: Set of websocket connections subscribed to that scooter's live state.
 *
 * This allows:
 *  - The scooter device connection itself
 *  - One or more admin dashboard connections watching the same scooter
 */
const rooms = new Map();

/**
 * Serialize and send a message to a WebSocket.
 *
 * @param {WebSocket} ws - The WebSocket connection.
 * @param {object} message - JSON-serializable payload.
 */
export function send(ws, message) {
  debug(`SEND: ${JSON.stringify(message)}`);
  ws.send(JSON.stringify(message));
}

/**
 * Get (or create) a room Set for the given scooter id.
 *
 * @param {string} key - Room key.
 * @returns {Set<WebSocket>} The Set of WebSockets subscribed to this scooter.
 */
export function getRoom(key) {
  debug(`Getting room ${key}`);
  let set = rooms.get(key);
  if (!set) {
    debug("Room doesn't exist. Creating.");
    set = new Set();
    rooms.set(key, set);
  }
  return set;
}

/**
 * Subscribe a WebSocket to a scooter room.
 *
 * The socket is automatically removed from the room on close.
 *
 * @param {string} key - Room key.
 * @param {WebSocket} ws - The WebSocket to add.
 */
export function joinRoom(key, ws) {
  const set = getRoom(key);
  set.add(ws);

  ws.on("close", () => {
    set.delete(ws);
    if (set.size === 0) rooms.delete(key);
  });
}

/**
 * Broadcast a message to every subscriber in a scooter room.
 *
 * @param {string} key - Room key.
 * @param {object} message - JSON-serializable payload.
 * @returns {number} How many clients were sent to (open sockets only).
 */
export function broadcastToRoom(key, message) {
  const set = rooms.get(key);
  if (!set) return 0;

  const data = JSON.stringify(message);
  let sent = 0;

  for (const ws of set) {
    if (ws.readyState === ws.OPEN) {
      ws.send(data);
      sent++;
    }
  }
  return sent;
}

/**
 * Send a command to all subscribers of a scooter (device + dashboards).
 *
 * Useful for rentals/admin flows:
 *  - lock/unlock scooter
 *  - force stop
 *  - request immediate state push, etc.
 *
 * @param {unknown} scooterId - Mongo ObjectId or string.
 * @param {object} cmd - Command payload. Will be wrapped as `{ type: "CMD", ...cmd }`.
 * @returns {boolean} True if the room existed (even if no sockets were open), else false.
 */
export function sendCommand(scooterId, cmd) {
  const key = String(scooterId);
  const existed = rooms.has(key);
  broadcastToRoom(key, { type: "CMD", ...cmd });
  return existed;
}

/**
 * Validate and normalize a HELLO message.
 *
 * This is intentionally minimal and easy to test.
 *
 * @param {any} msg
 * @returns {{ scooterId: string, role: "device" | "admin" }} normalized
 * @throws {Error} if invalid
 */
export function parseHello(msg) {
  if (msg?.type !== "HELLO") throw new Error("Expected HELLO");
  if (!msg.scooterId) throw new Error("Missing scooterId");

  const role = msg.role === "admin" ? "admin" : "device";
  return { scooterId: String(msg.scooterId), role };
}

/**
 * Validate and normalize a STATE message.
 *
 * @param {any} msg
 * @returns {{ battery?: number, lat?: number, lon?: number, speedKmh?: number, status?: string }}
 * @throws {Error} if invalid
 */
export function parseState(msg) {
  if (msg?.type !== "STATE") throw new Error("Expected STATE");

  const { battery, lat, lon, speedKmh, status } = msg;

  const out = {};
  if (battery != null)
    out.battery = Math.max(Math.min(100, Number(battery)), 0); // normalize battery level 0-100
  if (lat != null) out.lat = Number(lat);
  if (lon != null) out.lon = Number(lon);
  if (speedKmh != null) out.speedKmh = Number(speedKmh);
  if (status != null) out.status = String(status);

  return out;
}

/**
 * Create the per-connection message handler.
 *
 * @param {object} deps
 * @param {typeof Scooter} deps.ScooterModel - Mongoose model (or a test double).
 * @returns {(ws: WebSocket) => void} connection handler
 */
export function createConnectionHandler({ ScooterModel }) {
  return (ws) => {
    /**
     * First message must be HELLO, which identifies the scooter and (optionally) role.
     * We keep this "HELLO first" pattern because it works for both device clients and dashboards.
     */
    ws.once("message", async (raw) => {
      let hello;
      try {
        hello = JSON.parse(raw.toString());
      } catch {
        ws.close(1008, "Bad JSON");
        return;
      }

      let normalized;
      try {
        normalized = parseHello(hello);
      } catch (err) {
        ws.close(1008, err.message);
        return;
      }

      const key = normalized.scooterId;
      ws.scooterId = key;
      ws.role = normalized.role;
      joinRoom(key, ws);

      // Load scooter state from Mongo and send INIT to this socket
      const doc = await ScooterModel.findById(normalized.scooterId).lean();
      if (!doc) {
        ws.close(1008, "Unknown scooter");
        return;
      }

      send(ws, {
        type: "INIT",
        serverTime: Date.now(),
        telemetry: DEFAULT_TELEMETRY,
        state: {
          battery: doc.battery,
          lat: doc.lat,
          lon: doc.lon,
          speedKmh: doc.speedKmh,
          status: doc.status,
          mode: doc.mode,
        },
      });

      /**
       * Subsequent messages.
       * - Devices send STATE once per second or so
       */
      ws.on("message", async (raw2) => {
        let msg;
        try {
          msg = JSON.parse(raw2.toString());
        } catch {
          return; // ignore malformed
        }

        if (msg.type === "STATE") {
          // Only accept state updates from device connections
          if (ws.role !== "device") return;

          let patch;
          try {
            patch = parseState(msg);
          } catch {
            return;
          }

          const updated = await ScooterModel.findByIdAndUpdate(
            normalized.scooterId,
            {
              $set: {
                ...patch,
                lastSeenAt: new Date(),
              },
            },
            { new: true, runValidators: true },
          ).lean();

          if (!updated) {
            ws.close(1008, "Unknown scooter");
            return;
          }

          // Notify all subscribers (admin dashboards + device itself)
          broadcastToRoom(key, {
            type: "STATE",
            scooterId: normalized.scooterId,
            state: updated,
            serverTime: Date.now(),
          });
        }
      });

      ws.on("close", async () => {
        // Mark offline when the device disconnects
        if (ws.role === "device") {
          await ScooterModel.findByIdAndUpdate(normalized.scooterId, {
            status: "offline",
            lastSeenAt: new Date(),
          });
        }
      });
    });
  };
}

/**
 * Register the scooter WebSocket server on the given Node HTTP server.
 *
 * This attaches a WebSocket endpoint at `/ws/scooters`.
 *
 * Message flow (device):
 *  - Client -> { type: "HELLO", scooterId, role?: "device" }
 *  - Server -> { type: "INIT", state, updateIntervalMs, serverTime }
 *  - Client -> { type: "STATE", ...fields } (every ~1s)
 *
 * Message flow (admin dashboard):
 *  - Client -> { type: "HELLO", scooterId, role: "admin" }
 *  - Server -> { type: "INIT", ... }
 *  - Server -> { type: "STATE", scooterId, state, serverTime } (broadcasted updates)
 *
 * @param {{ server: import("http").Server }} ctx
 */
export function registerWebSockets({ server }) {
  const wss = new WebSocketServer({ server, path: "/ws/scooters" });

  const onConnection = createConnectionHandler({ ScooterModel: Scooter });

  wss.on("connection", onConnection);
}

/**
 * Test helper: clear all rooms/subscribers.
 *
 * @returns {void}
 */
export function __resetForTests() {
  rooms.clear();
}
