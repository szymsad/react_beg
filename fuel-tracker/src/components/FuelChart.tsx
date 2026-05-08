import "./FuelChart.css"
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import type { FuelEntry } from "../types/FuelEntry"
import { calcConsumptionData } from "../utils/fuelCalculations"

interface Props {
  entries: FuelEntry[]
}

const FUEL_COLORS = { petrol: "#2563eb", lpg: "#16a34a", diesel: "#b45309" }
const FUEL_LABELS = { petrol: "Benzyna", lpg: "LPG", diesel: "Diesel" }

function FuelChart({ entries }: Props) {
  const petrolData = calcConsumptionData(entries, "petrol")
  const lpgData = calcConsumptionData(entries, "lpg")
  const dieselData = calcConsumptionData(entries, "diesel")

  const allKeys = [
    ...petrolData.map(d => `${d.date} ${d.time}`),
    ...lpgData.map(d => `${d.date} ${d.time}`),
    ...dieselData.map(d => `${d.date} ${d.time}`),
  ]
  const uniqueKeys = [...new Set(allKeys)].sort()

  const chartData = uniqueKeys.map(key => ({
    label: key.slice(0, 10),
    petrol: petrolData.find(d => `${d.date} ${d.time}` === key)?.lper100km ?? null,
    lpg: lpgData.find(d => `${d.date} ${d.time}` === key)?.lper100km ?? null,
    diesel: dieselData.find(d => `${d.date} ${d.time}` === key)?.lper100km ?? null,
  }))

  if (chartData.length === 0) {
    return (
      <div className="fuel-chart">
        <h2>Spalanie L/100km</h2>
        <p className="fuel-chart__empty">Za mało danych do wykresu.</p>
      </div>
    )
  }

  return (
    <div className="fuel-chart">
      <h2>Spalanie L/100km</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis unit=" L" />
          <Tooltip
            formatter={(value: unknown, name: unknown) => [
              typeof value === "number" ? `${value} L/100km` : "—",
              FUEL_LABELS[name as keyof typeof FUEL_LABELS] ?? String(name),
            ]}
          />
          <Legend formatter={(v) => FUEL_LABELS[v as keyof typeof FUEL_LABELS] ?? v} />
          {petrolData.length > 0 && <Line type="monotone" dataKey="petrol" stroke={FUEL_COLORS.petrol} strokeWidth={2} dot={{ r: 4 }} connectNulls={false} name="petrol" />}
          {lpgData.length > 0 && <Line type="monotone" dataKey="lpg" stroke={FUEL_COLORS.lpg} strokeWidth={2} dot={{ r: 4 }} connectNulls={false} name="lpg" />}
          {dieselData.length > 0 && <Line type="monotone" dataKey="diesel" stroke={FUEL_COLORS.diesel} strokeWidth={2} dot={{ r: 4 }} connectNulls={false} name="diesel" />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default FuelChart