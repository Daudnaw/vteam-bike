/**
 * 
 */

export const BatteryService = {
  /**
   * Updates battery level based on status and speed.
   *
   * @param {object} bike
   * @param {string} status - in-use | available | locked | maintenance | charging
   * @param {number} speed - km/h (optional)
   */
  updateBattery(bike, status, speed = 0) {
    if (!bike) throw new Error("Bike is required");

    let drain = 0;

    switch (status) {
      case "in-use":
        // base drain when running
        drain += 0.3;

        // additional drain based on speed
        drain += speed * 0.05; // 5% per speed tid får vi lägga till
        break;

      case "available":
        // idle drain when parked outside
        drain += 0.05;
        break;

      case "locked":
      case "maintenance":
        // almost no drain
        drain += 0.01;
        break;

      case "charging":
        // charging instead of draining
        bike.batteryLevel += 1.0; // charge 1%
        break;

      default:
        throw new Error("Unknown status: " + status);
    }

    // only drain while not charging
    if (status !== "charging") {
      bike.batteryLevel -= drain;
    }

    // clamp between 0–100%
    if (bike.batteryLevel < 0) bike.batteryLevel = 0;
    if (bike.batteryLevel > 100) bike.batteryLevel = 100;

    // set warning flag
    bike.needsCharge = bike.batteryLevel < 10;

    return bike;
  }
};
