import type { FuelEntry } from "../types/FuelEntry"

interface Props {
  entries: FuelEntry[]
}

function FuelList({ entries }: Props) {
  return (
    <div>
      <h2>Tankowania</h2>
      <ul>
        {entries.map(entry => (
          <li key={entry.id}>
            {entry.date} | {entry.liters}L | {entry.pricePerLiter} zł | {entry.mileage} km
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FuelList