'use server'

const bikes = [
  {
    bikeId: "STOCKHOLM-001",
    status: "available",
    speed: 0,
    batteryLevel: 87,
    position: "Laddstation",
    rideLogs: [],
    needsCharge: false,
    currentCustomer: null,
    city: "Stockholm",
  },
  {
    bikeId: "STOCKHOLM-002",
    status: "in_use",
    speed: 12,
    batteryLevel: 65,
    position: "Fri parkering",
    rideLogs: [],
    needsCharge: false,
    currentCustomer: "KUND-001",
    city: "Stockholm",
  },
  {
    bikeId: "STOCKHOLM-003",
    status: "in_service",
    speed: 0,
    batteryLevel: 20,
    position: "Service",
    rideLogs: [],
    needsCharge: true,
    currentCustomer: null,
    city: "Stockholm",
  },
  {
    bikeId: "STOCKHOLM-004",
    status: "available",
    speed: 0,
    batteryLevel: 90,
    position: "Accepterad",
    rideLogs: [],
    needsCharge: false,
    currentCustomer: null,
    city: "Stockholm",
  },
];

export async function getBikes() {
    return bikes;
}

export async function deleteBike(bikeId) {
  console.log(`Bike ${bikeId} is deleted`);
  return { success: true };
}

export async function stopBike(bikeId) {
  console.log(`Bike ${bikeId} is stopped`);
  return { success: true };
}

export async function lockBike(bikeId) {
  console.log(`Bike ${bikeId} is locked`);
  return { success: true };
}

export async function maintainBike(bikeId) {
  console.log(`Bike ${bikeId} is set to maintenance`);
  return { success: true };
}

export async function readyBike(bikeId) {
  console.log(`Bike ${bikeId} is ready to use again`);
  return { success: true };
}