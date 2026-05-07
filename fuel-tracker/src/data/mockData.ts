import type { FuelEntry } from "../types/FuelEntry"

export const mockFuelData: FuelEntry[] = [
  {
    id: 1,
    carId: 1,
    date: "2026-04-20",
    liters: 45,
    pricePerLiter: 6.5,
    totalCost: 292.5,
    mileage: 150000
  },
  {
    id: 2,
    carId: 1,
    date: "2026-04-22",
    liters: 50,
    pricePerLiter: 6.3,
    totalCost: 315,
    mileage: 150400
  }
]