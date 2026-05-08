import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ResponsiveContainer
} from "recharts"
import type { FuelEntry } from "../types/FuelEntry"
import { calcConsumptionData } from "../utils/fuelCalculations"

interface Props {
  entries: FuelEntry[]
}

const FUEL_COLORS = {
  petrol: "#2563eb",
  lpg: "#16a34a",
  diesel: "#b45309",
}

const FUEL_LABELS = {
  petrol: "Benzyna",
  lpg: "LPG",
  diesel: "Diesel",
}

function FuelChart({ entries }: Props) {
  const petrolData = calcConsumptionData(entries, "petrol")
  const lpgData = calcConsumptionData(entries, "lpg")
  const dieselData = calcConsumptionData(entries, "diesel")

  // Scalamy wszystkie punkty w jeden dataset po dacie+czasie
  const allKeys = [
    ...petrolData.map(d => `${d.date} ${d.time}`),
    ...lpgData.map(d => `${d.date} ${d.time}`),
    ...dieselData.map(d => `${d.date} ${d.time}`),
  ]
  const uniqueKeys = [...new Set(allKeys)].sort()

  const chartData = uniqueKeys.map(key => {
    const p = petrolData.find(d => `${d.date} ${d.time}` === key)
    const l = lpgData.find(d => `${d.date} ${d.time}` === key)
    const di = dieselData.find(d => `${d.date} ${d.time}` === key)
    return {
      label: key.slice(0, 10),  // tylko data na osi X
      petrol: p?.lper100km ?? null,
      lpg: l?.lper100km ?? null,
      diesel: di?.lper100km ?? null,
    }
  })

  const hasPetrol = petrolData.length > 0
  const hasLpg = lpgData.length > 0
  const hasDiesel = dieselData.length > 0

  if (chartData.length === 0) {
    return <p>Za mało danych do wykresu</p>
  }

  return (
    <div>
      <h2>Spalanie L/100km</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis unit=" L" />
          <Tooltip
            formatter={(value, name) => [
              value !== null ? `${value} L/100km` : "—",
              FUEL_LABELS[name as keyof typeof FUEL_LABELS] ?? String(name)
            ]}
          />
          <Legend
            formatter={(value) => FUEL_LABELS[value as keyof typeof FUEL_LABELS] ?? value}
          />
          {hasPetrol && (
            <Line
              type="monotone"
              dataKey="petrol"
              stroke={FUEL_COLORS.petrol}
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls={false}
              name="petrol"
            />
          )}
          {hasLpg && (
            <Line
              type="monotone"
              dataKey="lpg"
              stroke={FUEL_COLORS.lpg}
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls={false}
              name="lpg"
            />
          )}
          {hasDiesel && (
            <Line
              type="monotone"
              dataKey="diesel"
              stroke={FUEL_COLORS.diesel}
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls={false}
              name="diesel"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default FuelChart