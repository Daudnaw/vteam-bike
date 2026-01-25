import { MODES } from "./Scooter.js";

/**
 * Battery sensor.
 *
 * Provides { battery } as a percentage [0..100].
 * Autonomous: drains over time, with drain influenced by mode and speed.
 *
 * Keeps scooter.state.battery updated whenever battery changes so the scooter
 * state is coherent between telemetry sends.
 */
export class BatterySensor {
  #battery;
  #timer = null;
  #scooter = null;

  #options = {
    tickMs: 1000,
    drainPerTickIdle: 0.005,
    drainPerTickActive: 0.05,

    // Linear speed influence: percent drained per tick per km/h.
    drainPerTickPerKmh: 0.002,

    maxSpeedKmhForDrain: 50,
  };

  /**
   * @param {object} [opts]
   * @param {number} [opts.battery=100]
   * @param {number} [opts.tickMs=1000]
   * @param {number} [opts.drainPerTickIdle=0.005]
   * @param {number} [opts.drainPerTickActive=0.05]
   * @param {number} [opts.drainPerTickPerKmh=0.002]
   * @param {number} [opts.maxSpeedKmhForDrain=50]
   */
  constructor({
    battery = 100,
    tickMs = 1000,
    drainPerTickIdle = 0.005,
    drainPerTickActive = 0.05,
    drainPerTickPerKmh = 0.002,
    maxSpeedKmhForDrain = 50,
  } = {}) {
    this.#battery = this.#clampPercent(battery);
    this.#options = {
      tickMs,
      drainPerTickIdle,
      drainPerTickActive,
      drainPerTickPerKmh,
      maxSpeedKmhForDrain,
    };
  }

  /**
   * Attach to scooter lifecycle and start autonomous battery updates.
   *
   * @param {{ scooter: any }} ctx
   */
  start({ scooter }) {
    this.#scooter = scooter;

    // Initialize scooter state immediately.
    if (this.#scooter?.state) this.#scooter.state.battery = this.#battery;

    if (this.#options.tickMs > 0) {
      this.#timer = setInterval(() => this.#tick(), this.#options.tickMs);
    }
  }

  /** Stop autonomous battery updates and detach from scooter. */
  stop() {
    if (this.#timer) clearInterval(this.#timer);
    this.#timer = null;
    this.#scooter = null;
  }

  /** @returns {{ battery: number }} */
  getState() {
    return { battery: this.#battery };
  }

  /**
   * Simulation hook: set battery percentage [0..100].
   *
   * @param {number} battery
   */
  set(battery) {
    this.#battery = this.#clampPercent(battery);
    this.#syncToScooter();
  }

  #tick() {
    const scooter = this.#scooter;
    const mode = scooter?.mode ?? MODES.IDLE;

    const base =
      mode === MODES.ACTIVE
        ? this.#options.drainPerTickActive
        : this.#options.drainPerTickIdle;

    const speedKmhRaw = Number(scooter?.state?.speedKmh ?? 0);
    const speedKmh = this.#clampSpeed(speedKmhRaw);

    const drain = base + this.#options.drainPerTickPerKmh * speedKmh;

    this.#battery = this.#clampPercent(this.#battery - drain);
    this.#syncToScooter();
  }

  #syncToScooter() {
    if (this.#scooter?.state) this.#scooter.state.battery = this.#battery;
  }

  #clampSpeed(v) {
    const n = Number.isFinite(v) ? v : 0;
    return Math.max(0, Math.min(this.#options.maxSpeedKmhForDrain, n));
  }

  #clampPercent(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }
}
