import FuelList from "./components/FuelList"
import { mockFuelData } from "./data/mockData"

function App() {
  return (
    <div>
      <h1>Fuel Tracker </h1>
      <FuelList entries={mockFuelData} />
    </div>
  )
}

export default App