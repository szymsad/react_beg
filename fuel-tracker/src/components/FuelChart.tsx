import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts"

import type { FuelEntry } from "../types/FuelEntry"

interface Props {
  entries: FuelEntry[]
}

function FuelChart({ entries }: Props) {
  const data = entries.map((entry, index) => {
    let consumption = null

    if (index > 0) {
      const prev = entries[index - 1]
      const distance = entry.mileage - prev.mileage

      if (distance > 0) {
        consumption = (entry.liters / distance) * 100
      }
    }

    return {
      date: entry.date,
      consumption
    }
  }).filter(d => d.consumption !== null)

  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="consumption" stroke="#8884d8" />
    </LineChart>
  )
}

export default FuelChart