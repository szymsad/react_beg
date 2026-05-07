import type { FuelEntry } from "../types/FuelEntry"
import {
  calcAvgConsumption,
  calcConsumptionData
} from "../utils/fuelCalculations"

interface Props {
  entries: FuelEntry[]
}

function FuelStats({ entries }: Props) {
  const avgConsumption = calcAvgConsumption(entries)

  const totalCost = entries.reduce((sum, entry) => {
    return sum + entry.totalCost
  }, 0)

  const totalRefuels = entries.length

  const lastEntry = entries[entries.length - 1]

  const consumptionData = calcConsumptionData(entries)

  const avgCostPerKm =
    consumptionData.length > 0
      ? (
          consumptionData.reduce((sum, item) => {
            return sum + item.costPerKm
          }, 0) / consumptionData.length
        ).toFixed(2)
      : "0"

  return (
    <div>
      <h2>Statystyki</h2>

      <div className="stats-grid">

        <div className="card">
          <h3>Średnie spalanie</h3>
          <p>{avgConsumption} L/100km</p>
        </div>

        <div className="card">
          <h3>Łączny koszt</h3>
          <p>{totalCost.toFixed(2)} zł</p>
        </div>

        <div className="card">
          <h3>Liczba tankowań</h3>
          <p>{totalRefuels}</p>
        </div>

        <div className="card">
          <h3>Ostatnie tankowanie</h3>
          <p>
            {lastEntry
              ? `${lastEntry.totalCost.toFixed(2)} zł`
              : "-"}
          </p>
        </div>

        <div className="card">
          <h3>Średni koszt / km</h3>
          <p>{avgCostPerKm} zł</p>
        </div>

      </div>
    </div>
  )
}

export default FuelStats