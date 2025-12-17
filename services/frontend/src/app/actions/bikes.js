'use server'

const bikes = {
  bikes: [
    {
      _id: "bike001",
      name: "Bike 1",
      lat: 59.331,
      lng: 18.065,
      status: "available"
    },
    {
      _id: "bike002",
      name: "Bike 2",
      lat: 59.334,
      lng: 18.071,
      status: "in_use"
    }
  ]
}

export async function getBikes() {
    return bikes;
}