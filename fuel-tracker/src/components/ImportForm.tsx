import { useRef, useState } from "react"
import "./ImportForm.css"
import type { Car } from "../types/Car"
import type { FuelEntry } from "../types/FuelEntry"

interface Props {
  cars: Car[]
  onImport: (entries: Omit<FuelEntry, "id">[], carId: number) => Promise<void>
}

function parseFuelType(tankNumber: string): "petrol" | "lpg" {
  return tankNumber === "1" ? "petrol" : "lpg"
}

function parseCsv(text: string): Omit<FuelEntry, "id" | "carId">[] {
  const lines = text.split("\n")
  const results: Omit<FuelEntry, "id" | "carId">[] = []

  // Pomiń nagłówek, zatrzymaj się na ## FavStations
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line.startsWith('"##')) break

    // Usuń cudzysłowy i podziel po przecinkach
    const cols = line.split(",").map(c => c.replace(/^"|"$/g, ""))

    const [dateTime, odo, fuel, full, price, , , , , notes, missed, tankNumber, , volumePrice, , excludeDistance] = cols

    if (!dateTime || !odo) continue

    const [datePart, timePart] = dateTime.split(" ")
    const fuelType = parseFuelType(tankNumber)
    const liters = parseFloat(fuel) || 0
    const pricePerLiter = parseFloat(volumePrice) || 0
    const totalCost = parseFloat(price) || 0
    const mileage = Math.round(parseFloat(odo))
    const kmOnPetrol = parseFloat(excludeDistance) || 0

    results.push({
      fuelType,
      date: datePart,
      time: timePart ?? "00:00",
      liters,
      pricePerLiter,
      totalCost,
      mileage,
      isFullTank: full === "1",
      missedPreviousRefuel: missed === "1",
      note: notes || undefined,
      kmOnPetrol: fuelType === "lpg" && kmOnPetrol > 0 ? kmOnPetrol : undefined,
    })
  }

  // Sortuj rosnąco po dacie (CSV jest od najnowszych)
  return results.sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
  )
}

function ImportForm({ cars, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [parsed, setParsed] = useState<Omit<FuelEntry, "id" | "carId">[] | null>(null)
  const [selectedCarId, setSelectedCarId] = useState<number>(cars[0]?.id ?? 0)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setDone(false)
    setError(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      try {
        const entries = parseCsv(text)
        if (entries.length === 0) {
          setError("Nie znaleziono żadnych tankowań w pliku.")
          setParsed(null)
        } else {
          setParsed(entries)
        }
      } catch {
        setError("Błąd parsowania pliku CSV.")
      }
    }
    reader.readAsText(file, "utf-8")
  }

  async function handleImport() {
    if (!parsed || !selectedCarId) return
    setLoading(true)
    setError(null)
    try {
      await onImport(parsed, selectedCarId)
      setDone(true)
      setParsed(null)
      if (fileRef.current) fileRef.current.value = ""
    } catch {
      setError("Błąd podczas importu. Spróbuj ponownie.")
    } finally {
      setLoading(false)
    }
  }

  const petrolCount = parsed?.filter(e => e.fuelType === "petrol").length ?? 0
  const lpgCount = parsed?.filter(e => e.fuelType === "lpg").length ?? 0

  return (
    <div className="import-form">
      <h2>Import CSV</h2>

      <div className="import-form__field">
        <label>Plik CSV</label>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFile}
        />
      </div>

      {error && <p className="import-form__error">⚠️ {error}</p>}

      {parsed && (
        <>
          <div className="import-form__preview">
            <div className="import-form__preview-stat">
              <span>📦 Wpisów razem</span>
              <strong>{parsed.length}</strong>
            </div>
            {petrolCount > 0 && (
              <div className="import-form__preview-stat">
                <span>⛽ Benzyna</span>
                <strong>{petrolCount}</strong>
              </div>
            )}
            {lpgCount > 0 && (
              <div className="import-form__preview-stat">
                <span>🟢 LPG</span>
                <strong>{lpgCount}</strong>
              </div>
            )}
            <div className="import-form__preview-stat">
              <span>📅 Od</span>
              <strong>{parsed[0].date}</strong>
            </div>
            <div className="import-form__preview-stat">
              <span>📅 Do</span>
              <strong>{parsed[parsed.length - 1].date}</strong>
            </div>
          </div>

          <div className="import-form__field">
            <label>Przypisz do auta</label>
            <select
              value={selectedCarId}
              onChange={e => setSelectedCarId(Number(e.target.value))}
            >
              {cars.map(car => (
                <option key={car.id} value={car.id}>
                  {car.name}{car.plate ? ` (${car.plate})` : ""}
                </option>
              ))}
            </select>
          </div>

          <button
            className="import-form__btn"
            onClick={handleImport}
            disabled={loading}
          >
            {loading ? "Importowanie..." : `Importuj ${parsed.length} tankowań`}
          </button>
        </>
      )}

      {done && (
        <p className="import-form__success">
          ✅ Import zakończony sukcesem!
        </p>
      )}
    </div>
  )
}

export default ImportForm