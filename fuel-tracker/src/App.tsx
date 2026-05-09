import "./App.css"
import { useEffect, useState } from "react"
import { useCar } from "./context/CarContext"
import { mockCars } from "./data/mockData"
import { getFuelEntries, saveFuelEntries } from "./services/fuelService"
import type { FuelEntry } from "./types/FuelEntry"
import FuelStats from "./components/FuelStats"
import FuelChart from "./components/FuelChart"
import FuelForm from "./components/FuelForm"
import FuelList from "./components/FuelList"
import Modal from "./components/Modal"

function App() {
  const [entries, setEntries] = useState<FuelEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<FuelEntry | null>(null)  // ← NOWE
  const { selectedCarId, setSelectedCarId } = useCar()

  useEffect(() => { getFuelEntries().then(setEntries) }, [])
  useEffect(() => { saveFuelEntries(entries) }, [entries])

  const filteredEntries = selectedCarId
    ? entries.filter(e => e.carId === selectedCarId)
    : entries

  function handleAddEntry(entry: FuelEntry) {
    setEntries(prev => [...prev, entry])
    setShowForm(false)
  }

  function handleEditEntry(updated: FuelEntry) {
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e))
    setEditingEntry(null)
  }

  function handleDeleteEntry(id: number) {
    setEntries(prev => prev.filter(e => e.id !== id))
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
            {mockCars.map(car => (
              <option key={car.id} value={car.id}>
                {car.name}{car.plate ? ` (${car.plate})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <FuelStats entries={filteredEntries} />
      </div>

      <div className="card">
        <FuelChart entries={filteredEntries} />
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
          entries={filteredEntries}
          onEdit={setEditingEntry}
          onDelete={handleDeleteEntry}
        />
      </div>

      {/* MODAL EDYCJI */}
      {editingEntry && (
        <Modal title="Edytuj tankowanie" onClose={() => setEditingEntry(null)}>
          <FuelForm
            onAdd={handleEditEntry}
            initialEntry={editingEntry}
          />
        </Modal>
      )}
    </div>
  )
}

export default App