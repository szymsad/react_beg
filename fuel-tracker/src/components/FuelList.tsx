import type { FuelEntry } from "../types/FuelEntry"

interface Props {
  entries: FuelEntry[]
}

function FuelList({ entries }: Props) {
  return (
    <div>
      <h2>Tankowania</h2>
      <ul>
        {entries.map((entry, index) => {
        const cost = entry.liters * entry.pricePerLiter

        let consumption = null

        if (index > 0) {
            const prev = entries[index - 1]
            const distance = entry.mileage - prev.mileage

            if (distance > 0) {
            consumption = (entry.liters / distance) * 100
            }
        }

        return (
            <li key={entry.id}>
            {entry.date} | {entry.liters}L | {entry.pricePerLiter} zł | {entry.mileage} km | 💰 {cost.toFixed(2)} zł
            {consumption && ` | ⛽ ${consumption.toFixed(2)} L/100km`}
            </li>
        )
        })}
        </ul>
    </div>
  )
}

export default FuelList