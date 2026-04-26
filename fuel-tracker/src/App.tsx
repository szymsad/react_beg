import { useState } from "react"
import FuelList from "./components/FuelList"
import { mockFuelData } from "./data/mockData"
import type { FuelEntry } from "./types/FuelEntry"
import FuelForm from "./components/FuelForm"
import FuelChart from "./components/FuelChart"

function App() {
  const [entries, setEntries] = useState<FuelEntry[]>(mockFuelData)

  function handleAddEntry(entry: FuelEntry) {
    setEntries([...entries, entry])
  }

  return (
    <div className="container">
      <h1>Fuel Tracker 🚗</h1>

      <div className="card">
        <FuelForm onAdd={handleAddEntry} />
      </div>

      <div className="card">
        <FuelChart entries={entries} />
      </div>

      <div className="card">
        <FuelList entries={entries} />
      </div>
    </div>
  )
}


export default App