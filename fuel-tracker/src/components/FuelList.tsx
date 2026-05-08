import type { FuelEntry } from "../types/FuelEntry"
import { calcEntryCost } from "../utils/fuelCalculations"

interface Props {
  entries: FuelEntry[]
}

const FUEL_ICON: Record<string, string> = {
  petrol: "⛽",
  lpg: "🟢",
  diesel: "🛢️",
}

const FUEL_LABEL: Record<string, string> = {
  petrol: "Benzyna",
  lpg: "LPG",
  diesel: "Diesel",
}

// Oblicza dystans od poprzedniego tankowania TEGO SAMEGO paliwa
function getDistanceFromPrev(entries: FuelEntry[], index: number): number | null {
  const entry = entries[index]
  for (let i = index - 1; i >= 0; i--) {
    if (entries[i].fuelType === entry.fuelType) {
      const dist = entry.mileage - entries[i].mileage
      return dist > 0 ? dist : null
    }
  }
  return null
}

function getConsumption(entries: FuelEntry[], index: number): number | null {
  const entry = entries[index]
  if (entry.missedPreviousRefuel) return null

  for (let i = index - 1; i >= 0; i--) {
    if (entries[i].fuelType === entry.fuelType) {
      let dist = entry.mileage - entries[i].mileage
      if (entry.fuelType === "lpg" && entry.kmOnPetrol) {
        dist -= entry.kmOnPetrol
      }
      if (dist <= 0) return null
      if (!entry.isFullTank) return null  // nie liczymy jeśli nie do pełna
      return Number(((entry.liters / dist) * 100).toFixed(2))
    }
  }
  return null
}

function FuelList({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div>
        <h2>Tankowania</h2>
        <p style={{ color: "#6b7280" }}>Brak tankowań dla wybranego auta.</p>
      </div>
    )
  }

  return (
    <div>
      <h2>Tankowania</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[...entries].reverse().map((entry, reversedIndex) => {
          const originalIndex = entries.length - 1 - reversedIndex
          const distance = getDistanceFromPrev(entries, originalIndex)
          const consumption = getConsumption(entries, originalIndex)

          return (
            <div
              key={entry.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "12px 16px",
                background: "white",
              }}
            >
              {/* NAGŁÓWEK — paliwo + data */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 16 }}>
                  {FUEL_ICON[entry.fuelType]} {FUEL_LABEL[entry.fuelType]}
                </span>
                <span style={{ color: "#6b7280", fontSize: 14 }}>
                  {entry.date} {entry.time}
                </span>
              </div>

              {/* GŁÓWNE INFO */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Przebieg</div>
                  <div style={{ fontWeight: 500 }}>{entry.mileage.toLocaleString()} km</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Przejechano</div>
                  <div style={{ fontWeight: 500 }}>
                    {distance !== null ? `${distance} km` : "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Spalanie</div>
                  <div style={{ fontWeight: 500 }}>
                    {consumption !== null ? `${consumption} L/100km` : "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Zatankowano</div>
                  <div style={{ fontWeight: 500 }}>{entry.liters} L</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Cena / litr</div>
                  <div style={{ fontWeight: 500 }}>{entry.pricePerLiter.toFixed(2)} zł</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Koszt</div>
                  <div style={{ fontWeight: 500, color: "#2563eb" }}>
                    {calcEntryCost(entry).toFixed(2)} zł
                  </div>
                </div>
              </div>

              {/* FLAGI — dodatkowe info */}
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {!entry.isFullTank && (
                  <span style={tagStyle("#fef3c7", "#92400e")}>
                    ⚠️ Nie do pełna
                    {entry.tankLevelAfter ? ` (${entry.tankLevelAfter} L w zbiorniku)` : ""}
                  </span>
                )}
                {entry.missedPreviousRefuel && (
                  <span style={tagStyle("#fee2e2", "#991b1b")}>
                    ⛔ Pominięto poprzednie tankowanie
                  </span>
                )}
                {entry.fuelType === "lpg" && entry.kmOnPetrol && entry.kmOnPetrol > 0 && (
                  <span style={tagStyle("#dbeafe", "#1e40af")}>
                    ⛽ {entry.kmOnPetrol} km na benzynie
                  </span>
                )}
                {entry.note && (
                  <span style={tagStyle("#f3f4f6", "#374151")}>
                    📝 {entry.note}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function tagStyle(bg: string, color: string): React.CSSProperties {
  return {
    background: bg,
    color,
    borderRadius: 6,
    padding: "2px 8px",
    fontSize: 12,
    fontWeight: 500,
  }
}

export default FuelList