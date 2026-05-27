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
  
  //const totalCost = entries.reduce((sum, e) => sum + e.totalCost, 0)
  const lastEntry = entries[entries.length - 1]

  const consumptionData = calcConsumptionData(entries)
  const consumptionPetrolData = calcConsumptionData(entries, "petrol")
  const consumptionLpgData = calcConsumptionData(entries, "lpg")
  const consumptionDieselData = calcConsumptionData(entries, "diesel")

  const hasLpg = entries.some(e => e.fuelType === "lpg")
  const hasDiesel = entries.some(e => e.fuelType === "diesel")

  const lastPetrolConsumption = consumptionPetrolData.at(-1)?.lper100km ?? null
  const lastLpgConsumption = consumptionLpgData.at(-1)?.lper100km ?? null
  const lastDieselConsumption = consumptionDieselData.at(-1)?.lper100km ?? null

  const lastPetrol = [...entries].reverse().find(e => e.fuelType === "petrol")
  const lastLpg    = [...entries].reverse().find(e => e.fuelType === "lpg")
  const lastDiesel = [...entries].reverse().find(e => e.fuelType === "diesel")

  const avgCostPerKm = consumptionData.length > 0
    ? (consumptionData.reduce((sum, d) => sum + d.costPerKm, 0) / consumptionData.length).toFixed(3)
    : "0"

  const avgCostLpgPerKm = consumptionLpgData.length > 0
    ? (consumptionLpgData.reduce((sum, d) => sum + d.costPerKm, 0) / consumptionLpgData.length).toFixed(3)
    : "0"

  function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split("-")
    return `${day}.${month}.${year}`
  }
  
  return (
    <div>
      <h2>Statystyki</h2>

      {lastEntry && (
        <div className="current-mileage">
          🚗 Aktualny przebieg: <strong>{lastEntry.mileage.toLocaleString()} km</strong>
        </div>
      )}

      <div className="stats-grid">
        {avgPetrol > 0 && (
          <div className="stat-card">
            <h3>Średnie spalanie ⛽ benzyna</h3>
            <p>{avgPetrol} L/100km</p>
          </div>
        )}
        {hasLpg && avgLpg > 0 && (
          <div className="stat-card">
            <h3>Średnie spalanie 🟢 LPG</h3>
            <p>{avgLpg} L/100km</p>
          </div>
        )}
        {hasDiesel && avgDiesel > 0 && (
          <div className="stat-card">
            <h3>Średnie spalanie 🛢️ diesel</h3>
            <p>{avgDiesel} L/100km</p>
          </div>
        )}
        <div className="stat-card">
          <h3>Średni koszt / km </h3>
          <p>{avgCostPerKm} zł</p>
        </div>
        {hasLpg && (
          <div className="stat-card">
            <h3>Średni koszt LPG / km</h3>
            <p>{avgCostLpgPerKm} zł</p>
          </div>
        )}

        {lastPetrol && (
          <div className="stat-card">
            <h3>Ostatnie ⛽ benzyna</h3>
            <p>{lastPetrol.totalCost.toFixed(2)} zł</p>
            <span className="stat-card__last">{formatDate(lastPetrol.date)} - <strong>{lastPetrol.liters} L - {lastPetrol.pricePerLiter.toFixed(2)} zł/L</strong></span>
            {lastPetrolConsumption !== null && (
              <span className="stat-card__last">Spalanie: <strong>{lastPetrolConsumption} L/100km</strong></span>
            )}
          </div>
        )}
        {lastLpg && (
          <div className="stat-card">
            <h3>Ostatnie 🟢 LPG</h3>
            <p>{lastLpg.totalCost.toFixed(2)} zł</p>
            <span className="stat-card__last">{formatDate(lastLpg.date)} - <strong>{lastLpg.liters} L - {lastLpg.pricePerLiter.toFixed(2)} zł/L</strong></span>
            {lastLpgConsumption !== null && (
              <span className="stat-card__last">Spalanie: <strong>{lastLpgConsumption} L/100km</strong></span>
            )}
          </div>
        )}
        {lastDiesel && (
          <div className="stat-card">
            <h3>Ostatnie 🛢️ diesel</h3>
            <p>{lastDiesel.totalCost.toFixed(2)} zł</p>
            <span className="stat-card__last">{formatDate(lastDiesel.date)} - <strong>{lastDiesel.liters} L - {lastDiesel.pricePerLiter.toFixed(2)} zł/L</strong></span>
            {lastDieselConsumption !== null && (
              <span className="stat-card__last">Spalanie: <strong>{lastDieselConsumption} L/100km</strong></span>
            )}
          </div>
        )}
      </div>

    </div>
  )
}


export default FuelStats