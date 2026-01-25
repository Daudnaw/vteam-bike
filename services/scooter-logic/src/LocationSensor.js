/**
 * Location sensor.
 *
 * Provides { lat, lon }.
 */
export class LocationSensor {
  #scooter = null;
  #lat;
  #lon;

  /**
   * @param {object} [opts]
   * @param {number} [opts.lat=0]
   * @param {number} [opts.lon=0]
   */
  constructor({ lat = 0, lon = 0 } = {}) {
    this.#lat = Number(lat);
    this.#lon = Number(lon);
  }

  /** @param {{ scooter: any }} _ctx */
  start({ scooter }) {
    this.#scooter = scooter;

    // Initialize scooter state immediately.
    if (this.#scooter?.state) {
      this.#scooter.state.lat = this.#lat;
      this.#scooter.state.lon = this.#lon;
    }
  }

  /** Detach from scooter */
  stop() {
    this.#scooter = null;
  }

  /** @returns {{ lat: number, lon: number }} */
  getState() {
    return { lat: this.#lat, lon: this.#lon };
  }

  /**
   * Simulation hook: set current location.
   * @param {number} lat
   * @param {number} lon
   */
  set(lat, lon) {
    this.#lat = Number(lat);
    this.#lon = Number(lon);

    if (this.#scooter?.state) {
      this.#scooter.state.lat = this.#lat;
      this.#scooter.state.lon = this.#lon;
    }
  }
}
