import type { FuelEntry } from "../types/FuelEntry"
import { calcEntryCost, calcConsumptionData } from "../utils/fuelCalculations"

interface Props {
  entries: FuelEntry[]
}

function FuelList({ entries }: Props) {
  const consumptionData = calcConsumptionData(entries)

  return (
    <div>
      <h2>Tankowania</h2>
      <ul>
        {entries.map((entry, index) => {
          // consumptionData ma o jeden element mniej (brak dla pierwszego wpisu)
          const stats = consumptionData[index - 1]

          return (
            <li key={entry.id}>
              {entry.date} | {entry.liters}L | {entry.pricePerLiter} zł/L |
              {entry.mileage} km | 💰 {calcEntryCost(entry)} zł
              {stats && ` | ⛽ ${stats.lper100km} L/100km`}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default FuelList