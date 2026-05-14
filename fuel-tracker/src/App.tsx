import "./App.css"
import { useEffect, useState } from "react"
import { useCar } from "./context/CarContext"
import { carApi, fuelApi } from "./services/fuelService"
import type { Car } from "./types/Car"
import type { FuelEntry } from "./types/FuelEntry"
import FuelStats from "./components/FuelStats"
import FuelChart from "./components/FuelChart"
import FuelForm from "./components/FuelForm"
import FuelList from "./components/FuelList"
import Modal from "./components/Modal"

function App() {
  const [cars, setCars] = useState<Car[]>([])
  const [entries, setEntries] = useState<FuelEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<FuelEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { selectedCarId, setSelectedCarId } = useCar()

  // Załaduj auta przy starcie
  useEffect(() => {
    carApi.getAll()
      .then(data => {
        setCars(data)
        // Ustaw pierwsze auto jeśli żadne nie wybrane
        if (!selectedCarId && data.length > 0) {
          setSelectedCarId(data[0].id)
        }
      })
      .catch(() => setError("Nie można załadować aut. Czy backend działa?"))
  }, [])

  // Załaduj tankowania gdy zmienia się wybrane auto
  useEffect(() => {
    if (!selectedCarId) return
    setLoading(true)
    fuelApi.getByCarId(selectedCarId)
      .then(data => { setEntries(data); setLoading(false) })
      .catch(() => { setError("Błąd ładowania tankowań."); setLoading(false) })
  }, [selectedCarId])

  async function handleAddEntry(entry: FuelEntry) {
    try {
      const created = await fuelApi.create({
        carId: entry.carId,
        fuelType: entry.fuelType,
        date: entry.date,
        time: entry.time,
        liters: entry.liters,
        pricePerLiter: entry.pricePerLiter,
        totalCost: entry.totalCost,
        mileage: entry.mileage,
        isFullTank: entry.isFullTank,
        tankLevelAfter: entry.tankLevelAfter,
        missedPreviousRefuel: entry.missedPreviousRefuel,
        kmOnPetrol: entry.kmOnPetrol,
        note: entry.note,
      })
      setEntries(prev => [...prev, created])
      setShowForm(false)
    } catch {
      setError("Błąd podczas dodawania tankowania.")
    }
  }

  async function handleEditEntry(entry: FuelEntry) {
    try {
      const updated = await fuelApi.update(entry.id, {
        carId: entry.carId,
        fuelType: entry.fuelType,
        date: entry.date,
        time: entry.time,
        liters: entry.liters,
        pricePerLiter: entry.pricePerLiter,
        totalCost: entry.totalCost,
        mileage: entry.mileage,
        isFullTank: entry.isFullTank,
        tankLevelAfter: entry.tankLevelAfter,
        missedPreviousRefuel: entry.missedPreviousRefuel,
        kmOnPetrol: entry.kmOnPetrol,
        note: entry.note,
      })
      setEntries(prev => prev.map(e => e.id === updated.id ? updated : e))
      setEditingEntry(null)
    } catch {
      setError("Błąd podczas edycji tankowania.")
    }
  }

  async function handleDeleteEntry(id: number) {
    try {
      await fuelApi.delete(id)
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch {
      setError("Błąd podczas usuwania tankowania.")
    }
  }

  return (
    <div className="container">
      <div className="app-header">
        <h1>Fuel Tracker 🚗</h1>
        <div className="car-selector">
          <label htmlFor="car-select">Auto:</label>
          <select
            id="car-select"
            value={selectedCarId ?? ""}
            onChange={e => setSelectedCarId(Number(e.target.value))}
          >
            {cars.map(car => (
              <option key={car.id} value={car.id}>
                {car.name}{car.plate ? ` (${car.plate})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="app-error">
          ⚠️ {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <div className="app-loading">Ładowanie...</div>
      ) : (
        <>
          <div className="card">
            <FuelStats entries={entries} />
          </div>

          <div className="card">
            <FuelChart entries={entries} />
          </div>

          <button className="btn-add" onClick={() => setShowForm(prev => !prev)}>
            {showForm ? "✕ Anuluj" : "+ Dodaj tankowanie"}
          </button>

          {showForm && (
            <div className="card">
              <FuelForm onAdd={handleAddEntry} />
            </div>
          )}

          <div className="card">
            <FuelList
              entries={entries}
              onEdit={setEditingEntry}
              onDelete={handleDeleteEntry}
            />
          </div>

          {editingEntry && (
            <Modal title="Edytuj tankowanie" onClose={() => setEditingEntry(null)}>
              <FuelForm onAdd={handleEditEntry} initialEntry={editingEntry} />
            </Modal>
          )}
        </>
      )}
    </div>
  )
}

export default App