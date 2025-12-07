/**
 * BikeService handles logic for controlling a bike.
 * This file contains NO database or backend logic. Pure affärs rules only.
 */

/**
 * const bike = {
  bikeId: "BIKE-001",
  status: "available",
  batteryLevel: 75,
  speed: 0,
  position: { lat: 59.3293, lng: 18.0686 },
  currentCustomer: null,
  rideLogs: [],
  needsCharge: false
};
 */
export const BikeService = {
  /**
   * Starts a bike rental for a customer.
   *
   * @param {object} bike - The bike object.
   * @param {string} customerId - Id of the customer starting the ride.
   * @returns {object} Updated bike object.
   * @throws {Error} If bike is missing or not available.
   */
  startBike(bike, customerId) {
    if (!bike) throw new Error("Bike object is required");

    if (bike.status !== "available")
      throw new Error("Bike is not available");

    if (bike.needsCharge) 
    throw new Error("Bike cannot be rented, low battery");

    bike.status = "in-use";
    bike.currentCustomer = customerId;

    // Initiera rideLogs om den är undefined
    bike.rideLogs ??= [];

    bike.rideLogs.push({
      customerId,
      start: {
        time: new Date(),
        position: { ...bike.position }
      },
      end: null
    });

    return bike;
  },

  /**
   * Stops an active bike ride.
   *
   * @param {object} bike - The bike object.
   * @returns {object} Updated bike object.
   * @throws {Error} If bike is missing or not currently in use.
   */
  stopBike(bike) {
    if (!bike) throw new Error("Bike is required");
    if (bike.status !== "in-use")
      throw new Error("Bike is not currently in use");

    bike.status = "available";
    bike.speed = 0;

    const lastLog = bike.rideLogs?.[bike.rideLogs.length - 1];

    if (lastLog && !lastLog.end) {
      lastLog.end = {
        time: new Date(),
        position: { ...bike.position }
      };
    }

    bike.currentCustomer = null;

    return bike;
  },

  /**
   * Updates the bikes position and speed.
   *
   * @param {object} bike - The bike object.
   * @param {number} lat - Latitude.
   * @param {number} lng - Longitude.
   * @param {number} speed - Current speed in km/h.
   * @returns {object} Updated bike object.
   * @throws {Error} If bike is missing.
   */
  updatePosition(bike, lat, lng, speed) {
    if (!bike) throw new Error("Bike is required");

    bike.position = { lat, lng };
    bike.speed = speed;

    // Automatisk låg batteri-varning
    if (bike.batteryLevel < 10) {
      bike.needsCharge = true;
    }

    return bike;
  },

  /**
   * Locks the bike (cannot be rented).
   *
   * @param {object} bike - The bike object.
   * @returns {object} Updated bike object.
   * @throws {Error} If bike is missing.
   */
  lockBike(bike) {
    if (!bike) throw new Error("Bike is required");

    bike.status = "locked";
    bike.speed = 0;
    return bike;
  },

  /**
   * Sets the bike into or out of maintenance mode.
   *
   * @param {object} bike - The bike object.
   * @param {boolean} [mode=true] - Whether to enable maintenance mode.
   * @returns {object} Updated bike object.
   * @throws {Error} If bike is missing.
   */
  setMaintenance(bike, mode = true) {
    if (!bike) throw new Error("Bike is required");

    bike.status = mode ? "maintenance" : "available";
    return bike;
  },

  /**
   * Controls whether the bike is charging.
   *
   * @param {object} bike - The bike object.
   * @param {boolean} [mode=true] - Whether to put bike in charging mode.
   * @returns {object} Updated bike object.
   * @throws {Error} If bike is missing.
   */
  setCharging(bike, mode = true) {
    if (!bike) throw new Error("Bike is required");

    bike.status = mode ? "charging" : "available";
    return bike;
  }
};
