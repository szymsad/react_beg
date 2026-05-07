import { useState } from "react"
import FuelList from "./components/FuelList"
import FuelForm from "./components/FuelForm"
import FuelChart from "./components/FuelChart"
import { mockFuelData, mockCars } from "./data/mockData"
import { useCar } from "./context/CarContext"
import type { FuelEntry } from "./types/FuelEntry"

function App() {
  const [entries, setEntries] = useState<FuelEntry[]>(mockFuelData)
  const { selectedCarId, setSelectedCarId } = useCar()

  // Filtrowanie po wybranym aucie — jedyne miejsce gdzie to się dzieje
  const filteredEntries = selectedCarId
    ? entries.filter(e => e.carId === selectedCarId)
    : entries

  function handleAddEntry(entry: FuelEntry) {
    setEntries(prev => [...prev, entry])
  }

  return (
    <div className="container">
      <h1>Fuel Tracker 🚗</h1>

      {/* Wybór auta */}
      <div className="card">
        <label htmlFor="car-select">Wybierz auto: </label>
        <select
          id="car-select"
          value={selectedCarId ?? ""}
          onChange={e => setSelectedCarId(Number(e.target.value))}
        >
          {mockCars.map(car => (
            <option key={car.id} value={car.id}>
              {car.name} {car.plate ? `(${car.plate})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        <FuelForm onAdd={handleAddEntry} />
      </div>

      <div className="card">
        <FuelChart entries={filteredEntries} />
      </div>

      <div className="card">
        <FuelList entries={filteredEntries} />
      </div>
    </div>
  )
}

export default App