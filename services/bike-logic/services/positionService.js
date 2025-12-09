import { CITIES } from "../data/cities.js";

//placerar cyklar lite slumpmässigt över hela staden
export const PositionService = {
  randomPosition(cityName) {
    const city = CITIES[cityName];
    if (!city) throw new Error("Unknown city");

    const lat = Math.random() * (city.maxLat - city.minLat) + city.minLat;
    const lng = Math.random() * (city.maxLng - city.minLng) + city.minLng;
    return { lat, lng };
  }
};
