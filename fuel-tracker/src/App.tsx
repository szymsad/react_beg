import { useState } from "react"
import FuelList from "./components/FuelList"
import { mockFuelData } from "./data/mockData"
import type { FuelEntry } from "./types/FuelEntry"
import FuelForm from "./components/FuelForm"

function App() {
  const [entries, setEntries] = useState<FuelEntry[]>(mockFuelData)

  function handleAddEntry(entry: FuelEntry) {
  setEntries([...entries, entry])
}
  return (
    <div>
      <h1>Fuel Tracker 🚗</h1>

      <FuelForm onAdd={handleAddEntry} />

      <FuelList entries={entries} />
    </div>
  )
}



export default App