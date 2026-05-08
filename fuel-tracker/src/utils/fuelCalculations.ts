import type { FuelEntry, FuelType } from "../types/FuelEntry"

// Zwraca dane do wykresu/statystyk dla danego typu paliwa
export function calcConsumptionData(entries: FuelEntry[], fuelType?: FuelType) {
  const filtered = fuelType
    ? entries.filter(e => e.fuelType === fuelType)
    : entries

  return filtered
    .map((entry, index) => {
      if (index === 0) return null
      if (entry.missedPreviousRefuel) return null  // pomijamy obliczanie

      const prev = filtered[index - 1]
      let distance = entry.mileage - prev.mileage

      // Dla LPG odejmujemy km przejechane na benzynie
      if (entry.fuelType === 'lpg' && entry.kmOnPetrol) {
        distance -= entry.kmOnPetrol
      }

      if (distance <= 0) return null

      return {
        date: entry.date,
        time: entry.time,
        fuelType: entry.fuelType,
        lper100km: Number(((entry.liters / distance) * 100).toFixed(2)),
        cost: entry.totalCost,
        costPerKm: Number((entry.totalCost / distance).toFixed(4)),
        isFullTank: entry.isFullTank,
      }
    })
    .filter((d): d is NonNullable<typeof d> => d !== null)
}

export function calcAvgConsumption(entries: FuelEntry[], fuelType?: FuelType): number {
  const data = calcConsumptionData(entries, fuelType)
  // liczymy tylko pełne tankowania do średniej
  const fullTankData = data.filter(d => d.isFullTank)
  if (fullTankData.length === 0) return 0
  return Number(
    (fullTankData.reduce((sum, d) => sum + d.lper100km, 0) / fullTankData.length).toFixed(2)
  )
}


export function calcEntryCost(entry: FuelEntry): number {
  return Number(entry.totalCost.toFixed(2))
}