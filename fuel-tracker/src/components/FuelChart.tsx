import { useState } from "react"
import "./FuelChart.css"
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ResponsiveContainer
} from "recharts"
import type { FuelEntry, FuelType } from "../types/FuelEntry"
import { calcConsumptionData } from "../utils/fuelCalculations"

interface Props {
  entries: FuelEntry[]
}

type ChartMode = "consumption" | "cost" | "price" | "liters" | "mileage"

const MODES: { key: ChartMode; label: string; unit: string }[] = [
  { key: "consumption", label: "L/100km",         unit: " L"  },
  { key: "cost",        label: "Koszt tankowania", unit: " zł" },
  { key: "price",       label: "Cena za litr",     unit: " zł" },
  { key: "liters",      label: "Litry",     unit: " L" },
  { key: "mileage",     label: "Przebieg",         unit: " km" },
]

const FUEL_COLORS = { petrol: "#2563eb", lpg: "#16a34a", diesel: "#b45309" }
const FUEL_LABELS = { petrol: "Benzyna", lpg: "LPG", diesel: "Diesel" }

function getChartData(entries: FuelEntry[], mode: ChartMode) {
  if (mode === "mileage") {
    return entries.map(e => ({
      key: `${e.date} ${e.time}`,
      label: e.date.slice(0, 10),
      petrol: e.fuelType === "petrol" ? e.mileage : null,
      lpg:    e.fuelType === "lpg"    ? e.mileage : null,
      diesel: e.fuelType === "diesel" ? e.mileage : null,
    }))
  }

  if (mode === "cost") {
    return entries.map(e => ({
      key: `${e.date} ${e.time}`,
      label: e.date.slice(0, 10),
      petrol: e.fuelType === "petrol" ? e.totalCost : null,
      lpg:    e.fuelType === "lpg"    ? e.totalCost : null,
      diesel: e.fuelType === "diesel" ? e.totalCost : null,
    }))
  }

  if (mode === "price") {
    return entries.map(e => ({
      key: `${e.date} ${e.time}`,
      label: e.date.slice(0, 10),
      petrol: e.fuelType === "petrol" ? e.pricePerLiter : null,
      lpg:    e.fuelType === "lpg"    ? e.pricePerLiter : null,
      diesel: e.fuelType === "diesel" ? e.pricePerLiter : null,
    }))
  }

  if (mode === "liters") {
    return entries.map(e => ({
      key: `${e.date} ${e.time}`,
      label: e.date.slice(0, 10),
      petrol: e.fuelType === "petrol" ? e.liters : null,
      lpg:    e.fuelType === "lpg"    ? e.liters : null,
      diesel: e.fuelType === "diesel" ? e.liters : null,
    }))
  }


  // consumption
  const petrolData = calcConsumptionData(entries, "petrol")
  const lpgData    = calcConsumptionData(entries, "lpg")
  const dieselData = calcConsumptionData(entries, "diesel")

  const allKeys = [
    ...petrolData.map(d => `${d.date} ${d.time}`),
    ...lpgData.map(d => `${d.date} ${d.time}`),
    ...dieselData.map(d => `${d.date} ${d.time}`),
  ]
  return [...new Set(allKeys)].sort().map(key => ({
    key,
    label: key.slice(0, 10),
    petrol: petrolData.find(d => `${d.date} ${d.time}` === key)?.lper100km ?? null,
    lpg:    lpgData.find(d => `${d.date} ${d.time}` === key)?.lper100km ?? null,
    diesel: dieselData.find(d => `${d.date} ${d.time}` === key)?.lper100km ?? null,
  }))
}

function FuelChart({ entries }: Props) {
  const [mode, setMode] = useState<ChartMode>("consumption")
  const [visible, setVisible] = useState<Record<FuelType, boolean>>({
    petrol: true, lpg: true, diesel: true,
  })

  const hasPetrol = entries.some(e => e.fuelType === "petrol")
  const hasLpg    = entries.some(e => e.fuelType === "lpg")
  const hasDiesel = entries.some(e => e.fuelType === "diesel")

  const chartData = getChartData(entries, mode)
  const currentUnit = MODES.find(m => m.key === mode)?.unit ?? ""

  function toggleFuel(fuel: FuelType) {
    setVisible(prev => ({ ...prev, [fuel]: !prev[fuel] }))
  }

  if (entries.length === 0) {
    return (
      <div className="fuel-chart">
        <h2>Wykres</h2>
        <p className="fuel-chart__empty">Za mało danych do wykresu.</p>
      </div>
    )
  }

  return (
    <div className="fuel-chart">
      <h2>Wykres</h2>

      <div className="fuel-chart__controls">
        <div className="fuel-chart__group">
          <span className="fuel-chart__group-label">Paliwo:</span>
          {(["petrol", "lpg", "diesel"] as FuelType[]).map(fuel => {
            const has = fuel === "petrol" ? hasPetrol : fuel === "lpg" ? hasLpg : hasDiesel
            if (!has) return null
            return (
              <button
                key={fuel}
                className={`fuel-chart__pill fuel-chart__pill--${fuel} ${visible[fuel] ? "fuel-chart__pill--active" : ""}`}
                onClick={() => toggleFuel(fuel)}
              >
                {FUEL_LABELS[fuel]}
              </button>
            )
          })}
        </div>

        <div className="fuel-chart__sep" />

        <div className="fuel-chart__group">
          <span className="fuel-chart__group-label">Widok:</span>
          {MODES.map(m => (
            <button
              key={m.key}
              className={`fuel-chart__mode ${mode === m.key ? "fuel-chart__mode--active" : ""}`}
              onClick={() => setMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={v => `${v}${currentUnit}`}
          />
          <Tooltip
            formatter={(value: unknown, name: unknown) => [
              typeof value === "number"
                ? `${value}${currentUnit}`
                : "—",
              FUEL_LABELS[name as FuelType] ?? String(name),
            ]}
          />
          <Legend formatter={v => FUEL_LABELS[v as FuelType] ?? v} />

          {(["petrol", "lpg", "diesel"] as FuelType[]).map(fuel => {
            const has = fuel === "petrol" ? hasPetrol : fuel === "lpg" ? hasLpg : hasDiesel
            if (!has || !visible[fuel]) return null
            return (
              <Line
                key={fuel}
                type="monotone"
                dataKey={fuel}
                name={fuel}
                stroke={FUEL_COLORS[fuel]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls={false}
                activeDot={{ r: 5 }}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default FuelChart