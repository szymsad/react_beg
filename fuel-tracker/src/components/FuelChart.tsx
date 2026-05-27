import { useState, useMemo, useRef, useEffect } from "react"
import "./FuelChart.css"
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ResponsiveContainer, Brush, ReferenceLine
} from "recharts"
import type { FuelEntry, FuelType } from "../types/FuelEntry"
import { calcConsumptionData, calcAvgConsumption } from "../utils/fuelCalculations"
import { Chart, registerables, type ChartDataset } from "chart.js"
Chart.register(...registerables)

interface Props {
  entries: FuelEntry[]
}

type ChartMode = "consumption" | "cost" | "price" | "liters" | "mileage"

const MODES: { key: ChartMode; label: string; unit: string }[] = [
  { key: "consumption", label: "L/100km",         unit: " L"  },
  { key: "cost",        label: "Koszt tankowania", unit: " zł" },
  { key: "price",       label: "Cena za litr",     unit: " zł" },
  { key: "liters",      label: "Litry",            unit: " L"  },
  { key: "mileage",     label: "Przebieg",         unit: " km" },
]

const PRESETS = [
  { label: "30 dni",     days: 30   },
  { label: "3 mies.",    days: 90   },
  { label: "6 mies.",    days: 180  },
  { label: "Rok",        days: 365  },
  { label: "Wszystko",   days: null },
]

const FUEL_COLORS = { petrol: "#2563eb", lpg: "#16a34a", diesel: "#b45309" }
const FUEL_LABELS: Record<FuelType, string> = { petrol: "Benzyna", lpg: "LPG", diesel: "Diesel" }



function fmt(d: string) {
  if (!d) return ""
  const [y, m, day] = d.split("-")
  return `${day}.${m}.${y}`
}

function getChartData(entries: FuelEntry[], mode: ChartMode) {
  if (mode === "mileage") {
    return entries.map(e => ({
      key: `${e.date} ${e.time}`,
      label: e.date,
      petrol: e.fuelType === "petrol" ? e.mileage : null,
      lpg:    e.fuelType === "lpg"    ? e.mileage : null,
      diesel: e.fuelType === "diesel" ? e.mileage : null,
    }))
  }
  if (mode === "cost") {
    return entries.map(e => ({
      key: `${e.date} ${e.time}`,
      label: e.date,
      petrol: e.fuelType === "petrol" ? e.totalCost : null,
      lpg:    e.fuelType === "lpg"    ? e.totalCost : null,
      diesel: e.fuelType === "diesel" ? e.totalCost : null,
    }))
  }
  if (mode === "price") {
    return entries.map(e => ({
      key: `${e.date} ${e.time}`,
      label: e.date,
      petrol: e.fuelType === "petrol" ? e.pricePerLiter : null,
      lpg:    e.fuelType === "lpg"    ? e.pricePerLiter : null,
      diesel: e.fuelType === "diesel" ? e.pricePerLiter : null,
    }))
  }
  if (mode === "liters") {
    return entries.map(e => ({
      key: `${e.date} ${e.time}`,
      label: e.date,
      petrol: e.fuelType === "petrol" ? e.liters : null,
      lpg:    e.fuelType === "lpg"    ? e.liters : null,
      diesel: e.fuelType === "diesel" ? e.liters : null,
    }))
  }
  // consumption
  const pd = calcConsumptionData(entries, "petrol")
  const ld = calcConsumptionData(entries, "lpg")
  const dd = calcConsumptionData(entries, "diesel")
  const allKeys = [
    ...pd.map(d => `${d.date} ${d.time}`),
    ...ld.map(d => `${d.date} ${d.time}`),
    ...dd.map(d => `${d.date} ${d.time}`),
  ]
  return [...new Set(allKeys)].sort().map(key => ({
    key,
    label: key.slice(0, 10),
    petrol: pd.find(d => `${d.date} ${d.time}` === key)?.lper100km ?? null,
    lpg:    ld.find(d => `${d.date} ${d.time}` === key)?.lper100km ?? null,
    diesel: dd.find(d => `${d.date} ${d.time}` === key)?.lper100km ?? null,
  }))
}

function FuelChart({ entries }: Props) {
  const [mode, setMode]           = useState<ChartMode>("consumption")
  const [visible, setVisible]     = useState<Record<FuelType, boolean>>({ petrol: true, lpg: true, diesel: true })
  const [dateFrom, setDateFrom]   = useState("")
  const [dateTo, setDateTo]       = useState("")
  const [brushRange, setBrushRange] = useState<{ start: number; end: number } | null>(null)

  const hasPetrol = entries.some(e => e.fuelType === "petrol")
  const hasLpg    = entries.some(e => e.fuelType === "lpg")
  const hasDiesel = entries.some(e => e.fuelType === "diesel")

  const chartRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  const minDate = useMemo(() =>
    entries.length > 0
      ? entries.reduce((min, e) => e.date < min ? e.date : min, entries[0].date)
      : ""
  , [entries])

  const maxDate = useMemo(() =>
    entries.length > 0
      ? entries.reduce((max, e) => e.date > max ? e.date : max, entries[0].date)
      : ""
  , [entries])

  useEffect(() => {
    setDateFrom(minDate)
    setDateTo(maxDate)
    setBrushRange(null)
  }, [minDate, maxDate])


  function setPreset(days: number | null) {
    if (days === null) {
      setDateFrom(""); setDateTo("")
    } else {
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - days)
      setDateFrom(from.toISOString().split("T")[0])
      setDateTo(to.toISOString().split("T")[0])
    }
    setBrushRange(null)
  }

  async function exportJpg() {
  setExporting(true)
  try {
    // Canvas poza ekranem - nie dotyka DOM strony
    const canvas = document.createElement("canvas")
    canvas.width = 1920
    canvas.height = 1080
    canvas.style.cssText = "position:absolute;left:-9999px;top:-9999px"
    document.body.appendChild(canvas)

    // Dane
    const labels = chartData.map(d => d.label)
    const datasets: ChartDataset<"line">[] = []

    if (hasPetrol && visible.petrol) datasets.push({
      label: "Benzyna",
      data: chartData.map(d => d.petrol),
      borderColor: "#2563eb",
      backgroundColor: "rgba(37,99,235,0.08)",
      borderWidth: 2.5,
      pointRadius: 3,
      tension: 0.1,
      spanGaps: false,
    })
    if (hasLpg && visible.lpg) datasets.push({
      label: "LPG",
      data: chartData.map(d => d.lpg),
      borderColor: "#16a34a",
      backgroundColor: "rgba(22,163,74,0.08)",
      borderWidth: 2.5,
      pointRadius: 3,
      tension: 0.1,
      spanGaps: false,
    })
    if (hasDiesel && visible.diesel) datasets.push({
      label: "Diesel",
      data: chartData.map(d => d.diesel),
      borderColor: "#b45309",
      backgroundColor: "rgba(180,83,9,0.08)",
      borderWidth: 2.5,
      pointRadius: 3,
      tension: 0.1,
      spanGaps: false,
    })

    // Linie średnich (rysowane przez plugin po wyrenderowaniu wykresu)
    const avgLines = mode === "consumption" ? [
      { value: avgPetrol, color: "#2563eb", show: hasPetrol && visible.petrol && avgPetrol > 0 },
      { value: avgLpg,    color: "#16a34a", show: hasLpg    && visible.lpg    && avgLpg    > 0 },
      { value: avgDiesel, color: "#b45309", show: hasDiesel && visible.diesel && avgDiesel > 0 },
    ].filter(a => a.show) : []

    const bgPlugin = {
      id: "bg",
      beforeDraw(chart: Chart) {
        const ctx = chart.ctx
        ctx.save()
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, chart.width, chart.height)
        ctx.restore()
      }
    }

    const avgPlugin = {
      id: "avgLines",
      afterDatasetsDraw(chart: Chart) {
        const ctx = chart.ctx
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const yScale = (chart as any).scales.y
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const xScale = (chart as any).scales.x

        avgLines.forEach(({ value, color }) => {
          const yPos = yScale.getPixelForValue(value)
          ctx.save()
          ctx.setLineDash([14, 7])
          ctx.strokeStyle = color
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(xScale.left, yPos)
          ctx.lineTo(xScale.right, yPos)
          ctx.stroke()

          const label = `śr. ${value} L`
          ctx.font = "bold 15px Arial"
          const tw = ctx.measureText(label).width
          ctx.setLineDash([])
          ctx.fillStyle = "rgba(255,255,255,0.88)"
          ctx.fillRect(xScale.left + 10, yPos + 5, tw + 10, 22)
          ctx.fillStyle = color
          ctx.fillText(label, xScale.left + 15, yPos + 21)
          ctx.restore()
        })
      }
    }

    const chart = new Chart(canvas, {
      type: "line",
      plugins: [bgPlugin, avgPlugin],
      data: { labels, datasets },
      options: {
        responsive: false,
        animation: false,
        layout: { padding: { top: 20, right: 60, bottom: 40, left: 20 } },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: { font: { size: 18 }, boxWidth: 24, padding: 20 },
          },
          title: {
            display: true,
            text: [
              MODES.find(m => m.key === mode)?.label ?? mode,
              `${fmt(stats?.dateStart ?? "")} - ${fmt(stats?.dateEnd ?? "")}  ·  ${stats?.count ?? 0} tankowań`,
            ],
            font: { size: 24 },
            padding: { top: 20, bottom: 24 },
            color: "#111827",
          },
        },
        scales: {
          x: {
            ticks: { font: { size: 13 }, maxRotation: 45, color: "#6b7280" },
            grid: { color: "rgba(0,0,0,0.07)" },
          },
          y: {
            min: yMin,
            max: yMax,
            ticks: {
              font: { size: 14 },
              color: "#6b7280",
              stepSize: 1,
              callback: (v: unknown) => `${v}${currentUnit}`,
            },
            grid: { color: "rgba(0,0,0,0.07)" },
          },
        },
      },
    })

    // Watermark
    const ctx2d = canvas.getContext("2d")!
    ctx2d.fillStyle = "#d1d5db"
    ctx2d.font = "22px Arial"
    ctx2d.textAlign = "right"
    ctx2d.fillText(
      `Fuel Tracker · ${new Date().toLocaleDateString("pl-PL")}`,
      1895, 1065
    )

    const link = document.createElement("a")
    link.download = `wykres-${mode}-${new Date().toISOString().slice(0, 10)}.jpg`
    link.href = canvas.toDataURL("image/jpeg", 0.95)
    link.click()

    chart.destroy()
    document.body.removeChild(canvas)
  } catch (e) {
    console.error("Błąd eksportu:", e)
  } finally {
    setExporting(false)
  }
}

  const filteredEntries = useMemo(() =>
    entries.filter(e => {
      if (dateFrom && e.date < dateFrom) return false
      if (dateTo && e.date > dateTo) return false
      return true
    }),
    [entries, dateFrom, dateTo]
  )

  const chartData = useMemo(() =>
    getChartData(filteredEntries, mode),
    [filteredEntries, mode]
  )

  // Wpisy odpowiadające zaznaczeniu Brush
  const selectedEntries = useMemo(() => {
    if (brushRange === null || chartData.length === 0) return filteredEntries
    const startKey = chartData[brushRange.start]?.key ?? ""
    const endKey   = chartData[brushRange.end]?.key ?? ""
    return filteredEntries.filter(e => {
      const k = `${e.date} ${e.time}`
      return k >= startKey && k <= endKey
    })
  }, [filteredEntries, brushRange, chartData])

  const stats = useMemo(() => {
    const e = selectedEntries
    if (e.length === 0) return null
    const totalCost   = e.reduce((s, x) => s + x.totalCost, 0)
    const totalLiters = e.reduce((s, x) => s + x.liters, 0)
    const petrol  = e.filter(x => x.fuelType === "petrol")
    const lpg     = e.filter(x => x.fuelType === "lpg")
    const diesel  = e.filter(x => x.fuelType === "diesel")
    return {
      count: e.length,
      totalCost,
      totalLiters,
      dateStart: e[0].date,
      dateEnd:   e[e.length - 1].date,
      avgPetrolPrice:       petrol.length  ? petrol.reduce((s, x)  => s + x.pricePerLiter, 0) / petrol.length  : null,
      avgLpgPrice:          lpg.length     ? lpg.reduce((s, x)     => s + x.pricePerLiter, 0) / lpg.length     : null,
      avgDieselPrice:       diesel.length  ? diesel.reduce((s, x)  => s + x.pricePerLiter, 0) / diesel.length  : null,
      avgPetrolConsumption: calcAvgConsumption(e, "petrol") || null,
      avgLpgConsumption:    calcAvgConsumption(e, "lpg")    || null,
      avgDieselConsumption: calcAvgConsumption(e, "diesel") || null,
    }
  }, [selectedEntries])

  const currentUnit = MODES.find(m => m.key === mode)?.unit ?? ""
  const isZoomed = brushRange !== null

  if (entries.length === 0) {
    return (
      <div className="fuel-chart">
        <h2>Wykres</h2>
        <p className="fuel-chart__empty">Za mało danych do wykresu.</p>
      </div>
    )
  }
    
  const avgPetrol = calcAvgConsumption(selectedEntries, "petrol")
  const avgLpg    = calcAvgConsumption(selectedEntries, "lpg")
  const avgDiesel = calcAvgConsumption(selectedEntries, "diesel")

  const yValues = chartData
    .flatMap(d => [d.petrol, d.lpg, d.diesel])
    .filter((v): v is number => v !== null && v > 0)

  const yMin = yValues.length > 0
    ? Math.max(0, parseFloat((Math.min(...yValues) - 1).toFixed(1)))
    : 0
  const yMax = yValues.length > 0
    ? parseFloat((Math.max(...yValues) + 1).toFixed(1))
    : 10

  const yTicks = Array.from(
    { length: yMax - yMin + 1 },
    (_, i) => yMin + i
  )

  return (
    <div className="fuel-chart">
      <div className="fuel-chart__export-bar">
        <h2>Wykres</h2>
        <button
          className="fuel-chart__export-btn"
          onClick={exportJpg}
          disabled={exporting}
        >
          {exporting ? "⏳ Generowanie..." : "⬇️ Pobierz JPG (Full HD)"}
        </button>
      </div>
      <div ref={chartRef}>
        {/* Filtry paliwa i widoku */}
        <div className="fuel-chart__controls" data-html2canvas-ignore="true">
          <div className="fuel-chart__group">
            <span className="fuel-chart__group-label">Paliwo:</span>
            {(["petrol", "lpg", "diesel"] as FuelType[]).map(fuel => {
              const has = fuel === "petrol" ? hasPetrol : fuel === "lpg" ? hasLpg : hasDiesel
              if (!has) return null
              return (
                <button key={fuel}
                  className={`fuel-chart__pill fuel-chart__pill--${fuel} ${visible[fuel] ? "fuel-chart__pill--active" : ""}`}
                  onClick={() => setVisible(prev => ({ ...prev, [fuel]: !prev[fuel] }))}
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
              <button key={m.key}
                className={`fuel-chart__mode ${mode === m.key ? "fuel-chart__mode--active" : ""}`}
                onClick={() => setMode(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtr daty */}
        <div className="fuel-chart__date-row" data-html2canvas-ignore="true">
          <div className="fuel-chart__group">
            <span className="fuel-chart__group-label">Okres:</span>
            {PRESETS.map(p => (
              <button key={p.label}
                className="fuel-chart__preset"
                onClick={() => setPreset(p.days)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="fuel-chart__date-inputs">
            <input type="date" value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setBrushRange(null) }} />
            <span className="fuel-chart__group-label">-</span>
            <input type="date" value={dateTo}
              onChange={e => { setDateTo(e.target.value); setBrushRange(null) }} />
          </div>
        </div>

        {/* Wykres */}
        <ResponsiveContainer width="100%" height={450}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis 
            tick={{ fontSize: 11 }} 
            tickFormatter={v => `${v}${currentUnit}`}
            domain={[yMin, yMax]}
            ticks={yTicks}
            allowDecimals={true}
            />
            {mode === "consumption" && hasPetrol && visible.petrol && avgPetrol > 0 && (
              <ReferenceLine
                y={avgPetrol}
                stroke={FUEL_COLORS.petrol}
                strokeDasharray="8 4"
                strokeWidth={1.5}
                label={{
                  value: `śr. ${avgPetrol} L`,
                  position: "insideBottomLeft",
                  fontSize: 11,
                  fill: FUEL_COLORS.petrol,
                  style: { fontSize: 15, fill: FUEL_COLORS.petrol, fontWeight: "bold" },
                }}
              />
            )}
            {mode === "consumption" && hasLpg && visible.lpg && avgLpg > 0 && (
              <ReferenceLine
                y={avgLpg}
                stroke={FUEL_COLORS.lpg}
                strokeDasharray="8 4"
                strokeWidth={1.5}
                label={{
                  value: `śr. ${avgLpg} L`,
                  position: "insideBottomLeft",
                  fontSize: 11,
                  fill: FUEL_COLORS.lpg,
                  style: { fontSize: 15, fill: FUEL_COLORS.lpg, fontWeight: "bold" },
                }}
              />
            )}
            {mode === "consumption" && hasDiesel && visible.diesel && avgDiesel > 0 && (
              <ReferenceLine
                y={avgDiesel}
                stroke={FUEL_COLORS.diesel}
                strokeDasharray="8 4"
                strokeWidth={1.5}
                label={{
                  value: `śr. ${avgDiesel} L`,
                  position: "insideBottomLeft",
                  fontSize: 11,
                  fill: FUEL_COLORS.diesel,
                  style: { fontSize: 15, fill: FUEL_COLORS.diesel, fontWeight: "bold" },
                }}
              />
            )}
            <Tooltip
              formatter={(value: unknown, name: unknown) => [
                typeof value === "number" ? `${value}${currentUnit}` : "-",
                FUEL_LABELS[name as FuelType] ?? String(name),
              ]}
              labelFormatter={l => fmt(String(l))}
            />
            <Legend formatter={v => FUEL_LABELS[v as FuelType] ?? v} />
            <Brush
              dataKey="label"
              height={24}
              stroke="#d1d5db"
              fill="#f9fafb"
              travellerWidth={8}
              onChange={({ startIndex, endIndex }) => {
                if (startIndex !== undefined && endIndex !== undefined && startIndex !== endIndex) {
                  setBrushRange({ start: startIndex, end: endIndex })
                } else {
                  setBrushRange(null)
                }
              }}
            />
            {(["petrol", "lpg", "diesel"] as FuelType[]).map(fuel => {
              const has = fuel === "petrol" ? hasPetrol : fuel === "lpg" ? hasLpg : hasDiesel
              if (!has || !visible[fuel]) return null
              return (
                <Line key={fuel} type="monotone" dataKey={fuel} name={fuel}
                  stroke={FUEL_COLORS[fuel]} strokeWidth={2}
                  dot={{ r: 3 }} connectNulls={false} activeDot={{ r: 5 }}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>

        <p className="fuel-chart__brush-hint" data-html2canvas-ignore="true">
          Przeciągnij suwak pod wykresem aby zaznaczyć okres do analizy.
        </p>

        {/* Statystyki okresu */}
        {stats && (
          <div className="fuel-chart__stats">
            <div className="fuel-chart__stats-header">
              <span>
                {isZoomed ? "📊 Statystyki zaznaczonego okresu" : "📊 Statystyki okresu"}
              </span>
              <span className="fuel-chart__stats-range">
                {fmt(stats.dateStart)} - {fmt(stats.dateEnd)}
                {" "}· {stats.count} tankowań
              </span>
            </div>
            <div className="fuel-chart__stats-grid">
              
              {stats.avgPetrolConsumption !== null && (
                <div className="fuel-chart__stat">
                  <span>Śr. spalanie benzyny⛽</span>
                  <strong>{stats.avgPetrolConsumption} L/100km</strong>
                </div>
              )}
              {stats.avgLpgConsumption !== null && (
                <div className="fuel-chart__stat">
                  <span>Śr. spalanie LPG 🟢</span>
                  <strong>{stats.avgLpgConsumption} L/100km</strong>
                </div>
              )}
              {stats.avgDieselConsumption !== null && (
                <div className="fuel-chart__stat">
                  <span>Śr. spalanie diesla 🛢️</span>
                  <strong>{stats.avgDieselConsumption} L/100km</strong>
                </div>
              )}
              {stats.avgPetrolPrice !== null && (
                <div className="fuel-chart__stat">
                  <span>Śr. cena benzyny ⛽</span>
                  <strong>{stats.avgPetrolPrice.toFixed(3)} zł/L</strong>
                </div>
              )}
              {stats.avgLpgPrice !== null && (
                <div className="fuel-chart__stat">
                  <span>Śr. cena LPG 🟢</span>
                  <strong>{stats.avgLpgPrice.toFixed(3)} zł/L</strong>
                </div>
              )}
              {stats.avgDieselPrice !== null && (
                <div className="fuel-chart__stat">
                  <span>Śr. cena diesla 🛢️</span>
                  <strong>{stats.avgDieselPrice.toFixed(3)} zł/L</strong>
                </div>
              )}
              <div className="fuel-chart__stat">
                <span>Łączny koszt</span>
                <strong>{stats.totalCost.toFixed(2)} zł</strong>
              </div>
              <div className="fuel-chart__stat">
                <span>Łączne litry</span>
                <strong>{stats.totalLiters.toFixed(1)} L</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FuelChart