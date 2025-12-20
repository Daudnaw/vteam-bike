import { BikeService } from "./services/bikeService.js";
import { MovementService } from "./services/movmentService.js";
import { PositionService } from "./services/positionService.js";
import { BatteryService } from "./services/batteryService.js";
import { CITIES } from "./data/cities.js";

/// Funktion för slumpmässig hastighet mellan min och max
const randomSpeed = (min = 5, max = 15) => Math.random() * (max - min) + min;

// Skapa cyklar per stad (10 cyklar per stad)
const bikes = [];

Object.keys(CITIES).forEach(cityName => {
  for (let i = 1; i <= 10; i++) {
    bikes.push({
      bikeId: `${cityName.toUpperCase()}-${i.toString().padStart(3, "0")}`,
      status: "available",
      speed: 0,
      batteryLevel: Math.random() * 50 + 50, // 50-100%
      position: PositionService.randomPosition(cityName),
      rideLogs: [],
      needsCharge: false,
      currentCustomer: null,
      city: cityName
    });
  }
});

// Placera cyklar på laddning, parkering och in-use per stad
Object.keys(CITIES).forEach(cityName => {
  const cityBikes = bikes.filter(b => b.city === cityName);
  const shuffled = cityBikes.sort(() => 0.5 - Math.random());

  // 4 cyklar på laddning
  shuffled.slice(0, 4).forEach(bike => {
    bike.status = "charging";
    bike.position = PositionService.randomPosition(cityName);
  });

  // 3 cyklar på parkering (available)
  shuffled.slice(4, 7).forEach(bike => {
    bike.status = "available";
    bike.position = PositionService.randomPosition(cityName);
  });

  // 3 cyklar in-use
  shuffled.slice(7, 10).forEach(bike => {
    BikeService.startBike(bike, `customer-${bike.bikeId}`);
    bike.speed = randomSpeed(5, 20); // slumpmässig hastighet
  });
});

// Tick varje sekund
setInterval(() => {
  bikes.forEach(bike => {
    // Uppdatera batteri enligt status och hastighet
    BatteryService.updateBattery(bike, bike.status, bike.speed);

    // Flytta in-use cyklar
    if (bike.status === "in-use") {
      MovementService.moveBike(bike);
    }

    console.log(
      `Bike ${bike.bikeId} | city: ${bike.city} | status: ${bike.status} | speed: ${bike.speed.toFixed(1)} | battery: ${bike.batteryLevel.toFixed(1)}% | pos: ${bike.position.lat.toFixed(5)},${bike.position.lng.toFixed(5)}`
    );
  });
  console.log("------------------------------------------------");
}, 1000);
