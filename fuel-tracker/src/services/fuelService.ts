import type { FuelEntry } from "../types/FuelEntry"
import { mockFuelData } from "../data/mockData"

const STORAGE_KEY = "fuel_entries"

export async function getFuelEntries(): Promise<FuelEntry[]> {
  const cached = localStorage.getItem(STORAGE_KEY)

  if (cached) {
    return JSON.parse(cached)
  }

  // później: replace with API call
  return mockFuelData
}

export function saveFuelEntries(entries: FuelEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}