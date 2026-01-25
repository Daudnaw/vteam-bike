/**
 * Speed sensor.
 *
 * Provides { speedKmh }.
 */
export class SpeedSensor {
  #scooter = null;
  #speedKmh;

  /**
   * @param {object} [opts]
   * @param {number} [opts.speedKmh=0]
   */
  constructor({ speedKmh = 0 } = {}) {
    this.#speedKmh = Math.max(0, Number(speedKmh));
  }

  /** @param {{ scooter: any }} _ctx */
  start({ scooter }) {
    this.#scooter = scooter;

    // Initialize scooter state immediately.
    if (this.#scooter?.state) this.#scooter.state.speedKmh = this.#speedKmh;
  }

  /** Detach from scooter */
  stop() {
    this.#scooter = null;
  }

  /** @returns {{ speedKmh: number }} */
  getState() {
    return { speedKmh: this.#speedKmh };
  }

  /**
   * Simulation hook: set speed in km/h.
   * @param {number} speedKmh
   */
  set(speedKmh) {
    this.#speedKmh = Math.max(0, Number(speedKmh));

    // Keep scooter state current between telemetry sends.
    if (this.#scooter?.state) this.#scooter.state.speedKmh = this.#speedKmh;
  }
}
