import { useEffect, useState } from "react"
import "./App.css"

import type { FuelEntry } from "./types/FuelEntry"
import type { Car } from "./types/Car"

import { useCar } from "./context/CarContext"

import FuelForm from "./components/FuelForm"
import FuelList from "./components/FuelList"
import FuelChart from "./components/FuelChart"
import FuelStats from "./components/FuelStats"
import Modal from "./components/Modal"
import ImportForm from "./components/ImportForm"
import CarPanel from "./components/CarPanel"

const API_BASE = import.meta.env.VITE_API_URL
const API_FUEL = `${API_BASE}/entries`
const API_CARS = `${API_BASE}/cars`

function App() {
  const [entries, setEntries] = useState<FuelEntry[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCarForm, setShowCarForm] = useState(false)
  const [showFuelForm, setShowFuelForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<FuelEntry | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [showCarPanel, setShowCarPanel] = useState(false)

  const { selectedCarId, setSelectedCarId } = useCar()

  useEffect(() => {
  fetchCars().finally(() => setLoading(false))
}, [])

useEffect(() => {
  if (!selectedCarId) {
    setEntries([])
    return
  }
  fetchEntries()
}, [selectedCarId])

  async function fetchEntries() {
    try {
      const url = selectedCarId
        ? `${API_FUEL}?carId=${selectedCarId}`
        : API_FUEL
      const response = await fetch(url)
      if (!response.ok) throw new Error("Błąd pobierania tankowań")
      setEntries(await response.json())
    } catch {
      setError("Nie można załadować tankowań.")
    }
  }

 async function fetchCars() {
  try {
    const response = await fetch(API_CARS)
    if (!response.ok) throw new Error("Błąd pobierania aut")
    const data: Car[] = await response.json()
    setCars(data)

    if (data.length === 0) return

    const alreadyValid = data.some(c => c.id === selectedCarId)
    if (alreadyValid) return

    const saved = localStorage.getItem("selectedCar")
    const savedId = saved ? Number(saved) : null
    const savedIsValid = savedId !== null && data.some(c => c.id === savedId)

    setSelectedCarId(savedIsValid ? savedId : data[0].id)
  } catch {
    setError("Nie można załadować aut. Czy backend działa?")
  }
}

  async function handleAddCar(car: Car) {
    try {
      const response = await fetch(API_CARS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(car),
      })
      if (!response.ok) throw new Error("Błąd dodawania auta")
      const created = await response.json()
      setCars(prev => [...prev, created])
      setShowCarForm(false)
    } catch {
      setError("Błąd podczas dodawania auta.")
    }
  }

  async function handleAddEntry(entry: FuelEntry) {
    try {
      const response = await fetch(API_FUEL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      })
      if (!response.ok) throw new Error("Błąd dodawania tankowania")
      const created = await response.json()
      setEntries(prev => [...prev, created])
      setShowFuelForm(false)
    } catch {
      setError("Błąd podczas dodawania tankowania.")
    }
  }

  async function handleEditEntry(updatedEntry: FuelEntry) {
    try {
      const response = await fetch(`${API_FUEL}/${updatedEntry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEntry),
      })
      if (!response.ok) throw new Error("Błąd edycji tankowania")
      const updated = await response.json()
      setEntries(prev => prev.map(e => e.id === updated.id ? updated : e))
      setEditingEntry(null)
    } catch {
      setError("Błąd podczas edycji tankowania.")
    }
  }

  async function handleDeleteEntry(id: number) {
    try {
      const response = await fetch(`${API_FUEL}/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Błąd usuwania tankowania")
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch {
      setError("Błąd podczas usuwania tankowania.")
    }
  }

  async function handleImport(
    entries: Omit<FuelEntry, "id">[],
    carId: number
  ) {
    for (const entry of entries) {
      const response = await fetch(API_FUEL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...entry, carId }),
      })
      if (!response.ok) throw new Error("Błąd importu")
    }
    // Odśwież listę po imporcie
    await fetchEntries()
    setShowImport(false)
  }

  async function handleEditCar(car: Car) {
    try {
      const response = await fetch(`${API_CARS}/${car.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(car),
      })
      if (!response.ok) throw new Error()
      const updated = await response.json()
      setCars(prev => prev.map(c => c.id === updated.id ? updated : c))
    } catch {
      setError("Błąd podczas edycji auta.")
    }
  }

  async function handleDeleteCar(id: number) {
  try {
    const response = await fetch(`${API_CARS}/${id}`, { method: "DELETE" })
    if (!response.ok) throw new Error()
    setCars(prev => {
      const next = prev.filter(c => c.id !== id)
      if (selectedCarId === id) {
        setSelectedCarId(next[0]?.id ?? null)
      }
      return next
    })
    setEntries(prev => prev.filter(e => e.carId !== id))
  } catch {
    setError("Błąd podczas usuwania auta.")
  }
}


  const filteredEntries = selectedCarId
    ? entries.filter(e => e.carId === selectedCarId)
    : entries

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

          {showImport && (
            <div className="card">
              <ImportForm cars={cars} onImport={handleImport} />
            </div>
          )}
          <button
            className="btn-add btn-add--cars"
            onClick={() => setShowCarPanel(prev => !prev)}
          >
            {showCarPanel ? "✕ Zamknij zarządzanie autami" : "🚗 Zarządzaj autami"}
          </button>

          {showCarPanel && (
            <div className="card">
              <CarPanel
                cars={cars}
                onAddCar={handleAddCar}
                onEditCar={handleEditCar}
                onDeleteCar={handleDeleteCar}
                onImport={handleImport}
              />
            </div>
          )}

          <button
            className="btn-add"
            onClick={() => setShowFuelForm(prev => !prev)}
          >
            {showFuelForm ? "✕ Anuluj" : "+ Dodaj tankowanie"}
          </button>

          {showFuelForm && (
            <div className="card">
              <FuelForm onAdd={handleAddEntry} cars={cars} />
            </div>
          )}

          <div className="card">
            <FuelStats entries={filteredEntries} />
          </div>

          <div className="card">
            <FuelChart entries={filteredEntries} />
          </div>

          <div className="card">
            <FuelList
              entries={filteredEntries}
              onEdit={setEditingEntry}
              onDelete={handleDeleteEntry}
            />
          </div>

          {editingEntry && (
            <Modal title="Edytuj tankowanie" onClose={() => setEditingEntry(null)}>
              <FuelForm
                onAdd={handleEditEntry}
                initialEntry={editingEntry}
                cars={cars}
              />
            </Modal>
          )}
        </>
      )}
    </div>
  )
}

export default App