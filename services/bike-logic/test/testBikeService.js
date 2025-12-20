// bike-logic/test/testBikeService.js

import { BikeService } from "../services/bikeService.js";

function createMockBike() {
  return {
    bikeId: "TEST-BIKE",
    status: "available",
    batteryLevel: 80,
    speed: 0,
    position: { lat: 59.3293, lng: 18.0686 },
    currentCustomer: null,
    rideLogs: []
  };
}

function log(title, result) {
  console.log("--------------------------------------------------");
  console.log(result);
  console.log("--------------------------------------------------\n");
}

function runTests() {
  console.log("Running BikeService tests...\n");

  // 1. Create bike
  const bike = createMockBike();
  log("Initial bike object", bike);

  // 2. Start bike
  BikeService.startBike(bike, "CUSTOMER-123");
  log("After startBike()", bike);

  // 3. Update position
  BikeService.updatePosition(bike, 59.3300, 18.0700, 15);
  log("After updatePosition()", bike);

  // 4. Stop bike
  BikeService.stopBike(bike);
  log("After stopBike()", bike);

  // 5. Lock bike
  BikeService.lockBike(bike);
  log("After lockBike()", bike);

  // 6. Set maintenance mode
  BikeService.setMaintenance(bike, true);
  log("After setMaintenance(true)", bike);

  // 7. Set charging mode
  BikeService.setCharging(bike, true);
  log("After setCharging(true)", bike);

  console.log("All ompleted.\n");
}

runTests();
