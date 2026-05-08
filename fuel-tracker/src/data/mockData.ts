import type { FuelEntry } from "../types/FuelEntry"
import type { Car } from "../types/Car"

export const mockCars: Car[] = [
  {
    id: 1,
    name: "Audi A4 B6 1.8T",
    plate: "WA 12345",
    tanks: ["petrol", "lpg"]
  },
  {
    id: 2,
    name: "Toyota Yaris 1.3",
    plate: "KR 99887",
    tanks: ["petrol"]
  },
  {
    id: 3,
    name: "BMW E91 320d",
    plate: "GD 4455K",
    tanks: ["diesel"]
  }
]

export const mockFuelData: FuelEntry[] = [
  // =========================
  // AUDI - PETROL
  // =========================

  {
    id: 1,
    carId: 1,
    fuelType: "petrol",
    date: "2026-04-01",
    time: "08:10",
    liters: 42,
    pricePerLiter: 6.49,
    totalCost: 272.58,
    mileage: 150000,
    isFullTank: true,
    missedPreviousRefuel: false
  },

  {
    id: 2,
    carId: 1,
    fuelType: "petrol",
    date: "2026-04-05",
    time: "18:20",
    liters: 18,
    pricePerLiter: 6.55,
    totalCost: 117.9,
    mileage: 150220,
    isFullTank: true,
    missedPreviousRefuel: false
  },

  // =========================
  // AUDI - LPG
  // =========================

  {
    id: 3,
    carId: 1,
    fuelType: "lpg",
    date: "2026-04-07",
    time: "07:55",
    liters: 41,
    pricePerLiter: 3.12,
    totalCost: 127.92,
    mileage: 150510,
    isFullTank: true,
    missedPreviousRefuel: false,
    kmOnPetrol: 14
  },

  {
    id: 4,
    carId: 1,
    fuelType: "lpg",
    date: "2026-04-10",
    time: "21:37",
    liters: 39,
    pricePerLiter: 3.09,
    totalCost: 120.51,
    mileage: 150890,
    isFullTank: true,
    missedPreviousRefuel: false,
    kmOnPetrol: 9
  },

  {
    id: 5,
    carId: 1,
    fuelType: "lpg",
    date: "2026-04-14",
    time: "12:22",
    liters: 20,
    pricePerLiter: 3.15,
    totalCost: 63,
    mileage: 151050,
    isFullTank: true,
    missedPreviousRefuel: false,
    kmOnPetrol: 6
  },

  {
    id: 6,
    carId: 1,
    fuelType: "lpg",
    date: "2026-04-18",
    time: "09:45",
    liters: 43,
    pricePerLiter: 3.18,
    totalCost: 136.74,
    mileage: 151430,
    isFullTank: true,
    missedPreviousRefuel: true,
    kmOnPetrol: 11
  },

  // =========================
  // TOYOTA
  // =========================

  {
    id: 7,
    carId: 2,
    fuelType: "petrol",
    date: "2026-04-02",
    time: "16:11",
    liters: 35,
    pricePerLiter: 6.44,
    totalCost: 225.4,
    mileage: 80200,
    isFullTank: true,
    missedPreviousRefuel: false
  },

  {
    id: 8,
    carId: 2,
    fuelType: "petrol",
    date: "2026-04-08",
    time: "08:01",
    liters: 33,
    pricePerLiter: 6.51,
    totalCost: 214.83,
    mileage: 80610,
    isFullTank: true,
    missedPreviousRefuel: false
  },

  {
    id: 9,
    carId: 2,
    fuelType: "petrol",
    date: "2026-04-15",
    time: "19:42",
    liters: 29,
    pricePerLiter: 6.59,
    totalCost: 191.11,
    mileage: 80990,
    isFullTank: true,
    missedPreviousRefuel: false
  },

  // =========================
  // BMW DIESEL
  // =========================

  {
    id: 10,
    carId: 3,
    fuelType: "diesel",
    date: "2026-04-03",
    time: "13:50",
    liters: 51,
    pricePerLiter: 6.67,
    totalCost: 340.17,
    mileage: 221000,
    isFullTank: true,
    missedPreviousRefuel: false
  },

  {
    id: 11,
    carId: 3,
    fuelType: "diesel",
    date: "2026-04-11",
    time: "07:30",
    liters: 49,
    pricePerLiter: 6.71,
    totalCost: 328.79,
    mileage: 221780,
    isFullTank: true,
    missedPreviousRefuel: false
  },

  {
    id: 12,
    carId: 3,
    fuelType: "diesel",
    date: "2026-04-19",
    time: "20:05",
    liters: 53,
    pricePerLiter: 6.75,
    totalCost: 357.75,
    mileage: 222620,
    isFullTank: true,
    missedPreviousRefuel: false
  }
]