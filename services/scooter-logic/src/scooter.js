import { EventEmitter } from "node:events";

export const MODES = Object.freeze({
  IDLE: "idle",
  ACTIVE: "active",
});

export const STATUSES = Object.freeze({
  AVAILABLE: "available",
  RENTED: "rented",
});

/**
 * Sensor contract used by the Scooter class.
 *
 * Sensors are constructed independently (no scooter reference in their constructor).
 * The scooter reference is provided later via `start({ scooter })`.
 *
 * @typedef {object} Sensor
 * @property {() => (object|Promise<object>)} getState
 * @property {(ctx: { scooter: Scooter }) => (void|Promise<void>)} [start]
 * @property {() => (void|Promise<void>)} [stop]
 */

/**
 * Scooter device client.
 *
 * - Connects to a server WebSocket endpoint
 * - Maintains state and mode ("idle" | "active")
 * - Applies telemetry intervals from INIT (and optionally CMD)
 * - Periodically sends STATE messages at an interval determined by mode
 * - Merges partial state snapshots from sensors before sending
 */
export class Scooter extends EventEmitter {
  #ws;
  #tickTimer = null;
  #ready = false;
  #closed = false;

  #telemetry = { activeIntervalMs: 1000, idleIntervalMs: 5000 };

  /** @type {Sensor[]} */
  #sensors = [];

  /** @type {Promise<void>[]} */
  #sensorStartPromises = [];

  /**
   * @param {object} opts
   * @param {string} opts.id Scooter id (Mongo ObjectId string).
   * @param {string} opts.url WebSocket URL, e.g. "ws://localhost:3000/ws/scooters".
   * @param {Sensor[]} [opts.sensors=[]]
   *        Sensor instances. Each sensor may optionally implement `start({ scooter })`,
   *        which will be called by the scooter after construction.
   * @param {number} [opts.reconnectDelayMs=1000] Delay before reconnecting after a close.
   */
  constructor({ id, url, sensors = [], reconnectDelayMs = 1000 }) {
    super();

    this.id = String(id);
    this.url = url;
    this.reconnectDelayMs = reconnectDelayMs;

    /**
     * Current mode. Determines which telemetry interval is used.
     * @type {"idle"|"active"}
     */
    this.mode = MODES.IDLE;

    /**
     * Current scooter state. Sensors provide dynamic fields and are merged into this object.
     */
    this.state = {
      _id: this.id,
      mode: MODES.IDLE,
      status: STATUSES.AVAILABLE,
      lastSeenAt: null,
    };

    this.#sensors = sensors;

    // Sensors have async initialization.
    // We start them immediately but save the promises so we can await them on INIT
    // before taking the first sensor snapshot.
    this.#sensorStartPromises = this.#sensors.map((sensor) =>
      Promise.resolve(sensor.start?.({ scooter: this })).catch(() => {}),
    );

    this.#connect();
  }

  /** Get the ready state of the scooter */
  get ready() {
    return this.#ready;
  }

  /** Start the scooter (active mode). Idempotent. */
  start() {
    if (this.mode === MODES.ACTIVE) return;

    this.mode = MODES.ACTIVE;
    this.state.mode = MODES.ACTIVE;
    this.state.status = STATUSES.RENTED;

    // Start/stop should be visible immediately on the server/dashboard,
    // not delayed until the next periodic tick.
    this.#sendStateNow().catch(() => {});
    this.#rescheduleTick(0);
  }

  /** Stop the scooter (idle mode). Idempotent. */
  stop() {
    if (this.mode === MODES.IDLE) return;

    this.mode = MODES.IDLE;
    this.state.mode = MODES.IDLE;
    this.state.status = STATUSES.AVAILABLE;
    this.state.speedKmh = 0;

    // Send an immediate state change so the system reacts promptly.
    this.#sendStateNow().catch(() => {});
    this.#rescheduleTick(0);
  }

  /**
   * Shut down telemetry, stop sensors, and close the WebSocket.
   *
   * @returns {Promise<void>}
   */
  async close() {
    // Without a "closed" flag, ws.onclose would trigger reconnect,
    // which breaks clean shutdowns.
    this.#closed = true;
    this.#ready = false;
    this.#clearTick();

    for (const sensor of this.#sensors) {
      await Promise.resolve(sensor.stop?.()).catch(() => {});
    }

    this.#ws?.close();
  }

  #connect() {
    if (this.#closed) return;

    this.#ws = new WebSocket(this.url);

    this.#ws.onopen = () => {
      this.#ready = false;
      this.#send({ type: "HELLO", scooterId: this.id, role: "device" });
    };

    this.#ws.onmessage = async ({ data }) => {
      let msg;
      try {
        msg = JSON.parse(data.toString());
      } catch {
        return;
      }

      try {
        await this.#handleMessage(msg);
      } catch {
        // Message handling must not take down the device loop.
        // We treat bad/partial messages as non-fatal.
      }
    };

    this.#ws.onclose = () => {
      this.#ready = false;
      this.#clearTick();

      if (this.#closed) return;

      // The scooter should be resilient to transient network failures.
      // We reconnect automatically so the device resumes telemetry without external help.
      setTimeout(() => this.#connect(), this.reconnectDelayMs);
    };

    this.#ws.onerror = () => {};
  }

  async #handleMessage(msg) {
    if (msg.type === "INIT") {
      if (msg.state && typeof msg.state === "object") {
        Object.assign(this.state, msg.state);
      }

      if (msg.telemetry && typeof msg.telemetry === "object") {
        this.#applyTelemetry(msg.telemetry);
      }

      // We want the first outgoing telemetry to reflect actual sensor readings,
      // not just the server's persisted state (which might be stale).
      // Await sensor readiness, then prime sensor state once before starting ticks.
      await Promise.all(this.#sensorStartPromises);
      await this.#primeSensorsOnce();

      const active =
        this.state.mode === MODES.ACTIVE ||
        this.state.status === STATUSES.RENTED;

      this.mode = active ? MODES.ACTIVE : MODES.IDLE;
      this.state.mode = this.mode;

      // We only start the telemetry loop after receiving INIT so we have:
      // - initial state
      // - server-provided telemetry intervals
      // - a first sensor snapshot
      this.#ready = true;
      this.#rescheduleTick(0);

      this.emit("READY");
      return;
    }

    if (msg.type === "CMD") {
      if (msg.telemetry && typeof msg.telemetry === "object") {
        this.#applyTelemetry(msg.telemetry);
      }

      switch (msg.action) {
        case "START":
          this.start();
          this.emit("START");
          break;
        case "STOP":
          this.stop();
          this.emit("STOP");
          break;
        default:
          break;
      }
    }
  }

  async #primeSensorsOnce() {
    const sensorState = await this.#collectSensorState();
    Object.assign(this.state, sensorState);
  }

  async #collectSensorState() {
    const merged = {};
    for (const sensor of this.#sensors) {
      const part = await sensor.getState();
      if (part && typeof part === "object") Object.assign(merged, part);
    }
    return merged;
  }

  async #tick() {
    if (!this.#ready) return;

    await this.#sendStateNow();

    const next =
      this.mode === MODES.ACTIVE
        ? this.#telemetry.activeIntervalMs
        : this.#telemetry.idleIntervalMs;

    this.#rescheduleTick(next);
  }

  async #sendStateNow() {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) return;

    const sensorState = await this.#collectSensorState();

    // We mutate the existing state object rather than replacing it.
    // This keeps state identity stable for any code holding references.
    Object.assign(this.state, sensorState);

    // Sensors can have stale info, when idle speed is always 0.
    if (this.mode === MODES.IDLE) {
      this.state.speedKmh = 0;
    }

    this.state.lastSeenAt = new Date().toISOString();

    this.#send({ type: "STATE", ...this.state });
  }

  #applyTelemetry(next) {
    const { activeIntervalMs, idleIntervalMs } = next ?? {};

    if (activeIntervalMs != null)
      this.#telemetry.activeIntervalMs = Number(activeIntervalMs);
    if (idleIntervalMs != null)
      this.#telemetry.idleIntervalMs = Number(idleIntervalMs);

    // Apply interval changes immediately so they affect the next scheduled tick,
    // rather than waiting for the old interval to elapse.
    this.#rescheduleTick(0);
  }

  #rescheduleTick(delayMs) {
    this.#clearTick();

    // Using a single reschedulable timer avoids multiple competing loops when
    // switching modes or updating telemetry intervals.
    this.#tickTimer = setTimeout(
      () => {
        this.#tick().catch(() => {});
      },
      Math.max(0, delayMs),
    );
  }

  #clearTick() {
    if (this.#tickTimer) clearTimeout(this.#tickTimer);
    this.#tickTimer = null;
  }

  #send(obj) {
    try {
      this.#ws?.send(JSON.stringify(obj));
    } catch {
      // ignored
    }
  }
}
