import "./FuelStats.css"
import type { FuelEntry } from "../types/FuelEntry"
import { calcAvgConsumption, calcConsumptionData } from "../utils/fuelCalculations"

interface Props {
  entries: FuelEntry[]
}

function FuelStats({ entries }: Props) {
  const avgPetrol = calcAvgConsumption(entries, "petrol")
  const avgLpg = calcAvgConsumption(entries, "lpg")
  const avgDiesel = calcAvgConsumption(entries, "diesel")

  const totalCost = entries.reduce((sum, e) => sum + e.totalCost, 0)
  const lastEntry = entries[entries.length - 1]
  const consumptionData = calcConsumptionData(entries)
  const consumptionLpgData = calcConsumptionData(entries, "lpg")

  const hasLpg = entries.some(e => e.fuelType === "lpg")

  const avgCostPerKm = consumptionData.length > 0
    ? (consumptionData.reduce((sum, d) => sum + d.costPerKm, 0) / consumptionData.length).toFixed(4)
    : "0"

  const avgCostLpgPerKm = consumptionLpgData.length > 0
    ? (consumptionLpgData.reduce((sum, d) => sum + d.costPerKm, 0) / consumptionLpgData.length).toFixed(4)
    : "0"

  return (
    <div>
      <h2>Statystyki</h2>
      <div className="stats-grid">
        {avgPetrol > 0 && (
          <div className="stat-card">
            <h3>Średnie spalanie ⛽</h3>
            <p>{avgPetrol} L/100km</p>
          </div>
        )}
        {hasLpg && avgLpg > 0 && (
          <div className="stat-card">
            <h3>Średnie spalanie 🟢</h3>
            <p>{avgLpg} L/100km</p>
          </div>
        )}
        {avgDiesel > 0 && (
          <div className="stat-card">
            <h3>Średnie spalanie 🛢️</h3>
            <p>{avgDiesel} L/100km</p>
          </div>
        )}
        <div className="stat-card">
          <h3>Łączny koszt</h3>
          <p>{totalCost.toFixed(2)} zł</p>
        </div>
        <div className="stat-card">
          <h3>Liczba tankowań</h3>
          <p>{entries.length}</p>
        </div>
        <div className="stat-card">
          <h3>Ostatnie tankowanie</h3>
          <p>{lastEntry ? `${lastEntry.totalCost.toFixed(2)} zł` : "—"}</p>
        </div>
        <div className="stat-card">
          <h3>Średni koszt / km</h3>
          <p>{avgCostPerKm} zł</p>
        </div>
        {hasLpg && (
          <div className="stat-card">
            <h3>Średni koszt LPG / km</h3>
            <p>{avgCostLpgPerKm} zł</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FuelStats