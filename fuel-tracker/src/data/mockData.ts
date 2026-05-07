import type { FuelEntry } from "../types/FuelEntry"
import type { Car } from "../types/Car"

export const mockCars: Car[] = [
  { id: 1, name: "Audi A4", plate: "WA 12345" },
  { id: 2, name: "Toyota Yaris", plate: "KR 99887" }
]

export const mockFuelData: FuelEntry[] = [
  {
    id: 1,
    carId: 1,          // ← DODAJ
    date: "2026-04-20",
    liters: 45,
    pricePerLiter: 6.5,
    totalCost: 292.5,
    mileage: 150000
  },
  {
    id: 2,
    carId: 1,          // ← DODAJ
    date: "2026-04-22",
    liters: 50,
    pricePerLiter: 6.3,
    totalCost: 315,
    mileage: 150400
  },
  {
    id: 3,
    carId: 2,          // ← drugie auto
    date: "2026-04-21",
    liters: 35,
    pricePerLiter: 6.4,
    totalCost: 224,
    mileage: 80000
  }
]