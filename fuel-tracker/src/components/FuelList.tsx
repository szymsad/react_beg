import "./FuelList.css"
import type { FuelEntry } from "../types/FuelEntry"
import { calcEntryCost } from "../utils/fuelCalculations"

interface Props {
  entries: FuelEntry[]
  onEdit: (entry: FuelEntry) => void   
  onDelete: (id: number) => void        
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
  if (!entry.isFullTank) return null

  for (let i = index - 1; i >= 0; i--) {
    if (entries[i].fuelType === entry.fuelType) {
      let dist = entry.mileage - entries[i].mileage
      if (entry.fuelType === "lpg" && entry.kmOnPetrol) {
        dist -= entry.kmOnPetrol
      }
      if (dist <= 0) return null
      return Number(((entry.liters / dist) * 100).toFixed(2))
    }
  }
  return null
}

function FuelList({  entries, onEdit, onDelete }: Props) {
  if (entries.length === 0) {
    return (
      <div>
        <h2>Tankowania</h2>
        <p className="fuel-list__empty">Brak tankowań dla wybranego auta.</p>
      </div>
    )
  }

  return (
    <div>
      <h2>Tankowania</h2>
      <div className="fuel-list__entries">
        {[...entries].reverse().map((entry, reversedIndex) => {
          const originalIndex = entries.length - 1 - reversedIndex
          const distance = getDistanceFromPrev(entries, originalIndex)
          const consumption = getConsumption(entries, originalIndex)

          return (
            <div key={entry.id} className="fuel-entry">
              <div className="fuel-entry__header">
                <span className="fuel-entry__fuel-type">
                  {FUEL_ICON[entry.fuelType]} {FUEL_LABEL[entry.fuelType]}
                </span>
                <span className="fuel-entry__datetime">
                  {entry.date} {entry.time}
                </span>
              </div>

              <div className="fuel-entry__grid">
                <div>
                  <div className="fuel-entry__cell-label">Przebieg</div>
                  <div className="fuel-entry__cell-value">{entry.mileage.toLocaleString()} km</div>
                </div>
                <div>
                  <div className="fuel-entry__cell-label">Przejechano</div>
                  <div className="fuel-entry__cell-value">
                    {distance !== null ? `${distance} km` : "—"}
                  </div>
                </div>
                <div>
                  <div className="fuel-entry__cell-label">Spalanie</div>
                  <div className="fuel-entry__cell-value">
                    {consumption !== null ? `${consumption} L/100km` : "—"}
                  </div>
                </div>
                <div>
                  <div className="fuel-entry__cell-label">Zatankowano</div>
                  <div className="fuel-entry__cell-value">{entry.liters} L</div>
                </div>
                <div>
                  <div className="fuel-entry__cell-label">Cena / litr</div>
                  <div className="fuel-entry__cell-value">{entry.pricePerLiter.toFixed(2)} zł</div>
                </div>
                <div>
                  <div className="fuel-entry__cell-label">Koszt</div>
                  <div className="fuel-entry__cell-value fuel-entry__cell-value--cost">
                    {calcEntryCost(entry).toFixed(2)} zł
                  </div>
                </div>
              </div>

              <div className="fuel-entry__flags">
                {!entry.isFullTank && (
                  <span className="fuel-entry__tag fuel-entry__tag--warning">
                    ⚠️ Nie do pełna{entry.tankLevelAfter ? ` (${entry.tankLevelAfter} L)` : ""}
                  </span>
                )}
                {entry.missedPreviousRefuel && (
                  <span className="fuel-entry__tag fuel-entry__tag--error">
                    ⛔ Pominięto poprzednie tankowanie
                  </span>
                )}
                {entry.fuelType === "lpg" && entry.kmOnPetrol && entry.kmOnPetrol > 0 && (
                  <span className="fuel-entry__tag fuel-entry__tag--info">
                    ⛽ {entry.kmOnPetrol} km na benzynie
                  </span>
                )}
                {entry.note && (
                  <span className="fuel-entry__tag fuel-entry__tag--neutral">
                    📝 {entry.note}
                  </span>
                )}
              </div>

              {/* PRZYCISKI AKCJI ← NOWE */}
              <div className="fuel-entry__actions">
                <button
                  className="fuel-entry__btn-edit"
                  onClick={() => onEdit(entry)}
                >
                  ✏️ Edytuj
                </button>
                <button
                  className="fuel-entry__btn-delete"
                  onClick={() => {
                    if (confirm("Usunąć to tankowanie?")) onDelete(entry.id)
                  }}
                >
                  🗑️ Usuń
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FuelList