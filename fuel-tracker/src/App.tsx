import { useState } from "react"
import FuelList from "./components/FuelList"
import { mockFuelData } from "./data/mockData"
import type { FuelEntry } from "./types/FuelEntry"

function App() {
  const [entries, setEntries] = useState<FuelEntry[]>(mockFuelData)

  return (
    <div>
      <h1>Fuel Tracker 🚗</h1>

      <button onClick={() => {
        const newEntry: FuelEntry = {
          id: Date.now(),
          date: "2026-04-25",
          liters: 42,
          pricePerLiter: 6.4,
          mileage: 150800
        }

        setEntries([...entries, newEntry])
      }}>
        Dodaj tankowanie
      </button>

      <FuelList entries={entries} />
    </div>
  )
}

export default App