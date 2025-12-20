import { BatteryService } from "./batteryService.js";


//updatera batterinivå och förflyttningar för in-use cyklar
export const MovementService = {
  moveBike(bike) {
    if (!bike || bike.status !== "in-use") return bike;

    const speed = bike.speed || 5;

    // slumpmässig liten förändring i lat/lng
    const deltaLat = (Math.random() - 0.5) * 0.0001 * speed;
    const deltaLng = (Math.random() - 0.5) * 0.0001 * speed;

    bike.position.lat += deltaLat;
    bike.position.lng += deltaLng;

    // uppdatera batteri
    BatteryService.updateBattery(bike, "in-use", speed);

    return bike;
  }
};
