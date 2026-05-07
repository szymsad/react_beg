import { useState } from "react"
import FuelList from "./components/FuelList"
import { mockFuelData } from "./data/mockData"
import { mockCars} from "./data/mockCars"
import type { FuelEntry } from "./types/FuelEntry"
import FuelForm from "./components/FuelForm"
import FuelChart from "./components/FuelChart"

function App() {
  const [entries, setEntries] = useState<FuelEntry[]>(mockFuelData)
  const [cars] = useState(mockCars)
  console.log("cars:", cars)
  const [selectedCarId, setSelectedCarId] = useState(cars[0]?.id ?? 1)
  function handleAddEntry(entry: FuelEntry) {
    setEntries([...entries, entry])
  }

  const filteredEntries = entries.filter(
    e => e.carId === selectedCarId
  )
  return (
    <div className="container">
      <h1>Fuel Tracker 🚗</h1>

      <div className="card">
        <h3>Wybierz auto</h3>

        <select
          //value={selectedCarId}
          onChange={(e) => setSelectedCarId(Number(e.target.value))}
        >
          {cars.map(car => (
            <option key={car.id} value={car.id}>
              {car.name}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        <FuelForm onAdd={handleAddEntry} carId={selectedCarId} />
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