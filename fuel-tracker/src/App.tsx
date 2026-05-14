import { useEffect, useState } from "react"
import "./App.css"

import type { FuelEntry } from "./types/FuelEntry"
import type { Car } from "./types/Car"

import { useCar } from "./context/CarContext"

import FuelForm from "./components/FuelForm"
import FuelList from "./components/FuelList"
import FuelChart from "./components/FuelChart"
import FuelStats from "./components/FuelStats"

const API_FUEL = "http://localhost:5103/api/entries"
const API_CARS = "http://localhost:5103/api/cars"

function App() {
  const [entries, setEntries] = useState<FuelEntry[]>([])
  const [cars, setCars] = useState<Car[]>([])

  const { selectedCarId, setSelectedCarId } = useCar()

  useEffect(() => {
    fetchEntries()
    fetchCars()
  }, [])

  async function fetchEntries() {
    try {
      const response = await fetch(API_FUEL)

      if (!response.ok) {
        throw new Error("Błąd pobierania tankowań")
      }

      const data = await response.json()

      setEntries(data)
    } catch (error) {
      console.error(error)
    }
  }

  async function fetchCars() {
    try {
      const response = await fetch(API_CARS)

      if (!response.ok) {
        throw new Error("Błąd pobierania aut")
      }

      const data = await response.json()

      setCars(data)
    } catch (error) {
      console.error(error)
    }
  }

  async function handleAddEntry(entry: FuelEntry) {
    try {
      const response = await fetch(API_FUEL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      })

      if (!response.ok) {
        throw new Error("Błąd dodawania tankowania")
      }

      const createdEntry = await response.json()

      setEntries(prev => [...prev, createdEntry])
    } catch (error) {
      console.error(error)
    }
  }

  async function handleDeleteEntry(id: number) {
  try {
    const response = await fetch(`${API_FUEL}/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Błąd usuwania tankowania")
    }

    setEntries(prev => prev.filter(e => e.id !== id))
  } catch (error) {
    console.error(error)
  }
}

async function handleEditEntry(updatedEntry: FuelEntry) {
  try {
    const response = await fetch(
      `${API_FUEL}/${updatedEntry.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEntry),
      }
    )

    if (!response.ok) {
      throw new Error("Błąd edycji tankowania")
    }

    setEntries(prev =>
      prev.map(entry =>
        entry.id === updatedEntry.id
          ? updatedEntry
          : entry
      )
    )
  } catch (error) {
    console.error(error)
  }
}

  const filteredEntries = selectedCarId
    ? entries.filter(e => e.carId === selectedCarId)
    : entries

  return (
    <div className="container">
      <h1>Fuel Tracker 🚗</h1>

      <div className="card">
        <h2>Wybierz auto</h2>

        <select
          value={selectedCarId ?? ""}
          onChange={(e) => setSelectedCarId(Number(e.target.value))}
        >
          {cars.map(car => (
            <option key={car.id} value={car.id}>
              {car.name} ({car.plate})
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        <FuelForm
          onAdd={handleAddEntry}
          cars={cars}
        />
      </div>

      <div className="card">
        <FuelStats entries={filteredEntries} />
      </div>

      <div className="card">
        <FuelChart entries={filteredEntries} />
      </div>

      <div className="card">
        <FuelList
          entries={filteredEntries}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
        />
      </div>
    </div>
  )
}

export default App