import type { Car } from "../types/Car"
import type { FuelEntry } from "../types/FuelEntry"

const BASE = "http://localhost:5103/api"

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json()
}

// AUTA
export const carApi = {
  getAll: (): Promise<Car[]> =>
    fetch(`${BASE}/cars`).then(handleResponse<Car[]>),

  create: (car: Omit<Car, "id">): Promise<Car> =>
    fetch(`${BASE}/cars`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(car),
    }).then(handleResponse<Car>),

  update: (id: number, car: Omit<Car, "id">): Promise<Car> =>
    fetch(`${BASE}/cars/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(car),
    }).then(handleResponse<Car>),

  delete: (id: number): Promise<void> =>
    fetch(`${BASE}/cars/${id}`, { method: "DELETE" }).then(() => {}),
}

// TANKOWANIA
export const fuelApi = {
  getByCarId: (carId: number): Promise<FuelEntry[]> =>
    fetch(`${BASE}/entries?carId=${carId}`).then(handleResponse<FuelEntry[]>),

  create: (entry: Omit<FuelEntry, "id">): Promise<FuelEntry> =>
    fetch(`${BASE}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    }).then(handleResponse<FuelEntry>),

  update: (id: number, entry: Omit<FuelEntry, "id">): Promise<FuelEntry> =>
    fetch(`${BASE}/entries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    }).then(handleResponse<FuelEntry>),

  delete: (id: number): Promise<void> =>
    fetch(`${BASE}/entries/${id}`, { method: "DELETE" }).then(() => {}),
}