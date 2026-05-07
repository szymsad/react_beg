import type { FuelEntry } from "../types/FuelEntry"

// Oblicza spalanie dla każdego wpisu (relative do poprzedniego)
export function calcConsumptionData(entries: FuelEntry[]) {
  return entries
    .map((entry, index) => {
      if (index === 0) return null
      const prev = entries[index - 1]
      const distance = entry.mileage - prev.mileage
      if (distance <= 0) return null

      return {
        date: entry.date,
        lper100km: Number(((entry.liters / distance) * 100).toFixed(2)),
        cost: Number((entry.liters * entry.pricePerLiter).toFixed(2)),
        costPerKm: Number(((entry.liters * entry.pricePerLiter) / distance).toFixed(4)),
      }
    })
    .filter((d): d is NonNullable<typeof d> => d !== null)
}

// Średnie spalanie
export function calcAvgConsumption(entries: FuelEntry[]): number {
  const data = calcConsumptionData(entries)
  if (data.length === 0) return 0
  return Number(
    (data.reduce((sum, d) => sum + d.lper100km, 0) / data.length).toFixed(2)
  )
}

// Koszt danego wpisu
export function calcEntryCost(entry: FuelEntry): number {
  return Number((entry.liters * entry.pricePerLiter).toFixed(2))
}