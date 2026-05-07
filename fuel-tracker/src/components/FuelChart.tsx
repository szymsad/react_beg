import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import type { FuelEntry } from "../types/FuelEntry"
import { calcConsumptionData } from "../utils/fuelCalculations"

interface Props {
  entries: FuelEntry[]
}

function FuelChart({ entries }: Props) {
  const data = calcConsumptionData(entries)
  // data to gotowy format { date, lper100km, cost, costPerKm }
  // Recharts tego wymaga — masz teraz dwa wykresy za darmo

  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="lper100km" stroke="#8884d8" name="L/100km" />
    </LineChart>
  )
}

export default FuelChart