import { useState } from "react"

import "./CarForm.css"

import type { Car } from "../types/Car"
import type { FuelTankType } from "../types/Car"

interface Props {
  onAdd: (car: Car) => void
}

function CarForm({ onAdd }: Props) {
  const [name, setName] = useState("")
  const [plate, setPlate] = useState("")
  const [make, setMake] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState("")

  const [tanks, setTanks] = useState<FuelTankType[]>([])

  function toggleTank(tank: FuelTankType) {
    setTanks(prev => {
      if (prev.includes(tank)) {
        return prev.filter(t => t !== tank)
      }

      return [...prev, tank]
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (tanks.length === 0) {
      alert("Wybierz przynajmniej jeden zbiornik")
      return
    }

    const newCar: Car = {
      id: Date.now(),
      name,
      plate,
      make,
      model,
      year: Number(year),
      tanks,
    }

    onAdd(newCar)

    setName("")
    setPlate("")
    setMake("")
    setModel("")
    setYear("")
    setTanks([])
  }

  return (
    <form className="car-form" onSubmit={handleSubmit}>
      <h2>Dodaj auto</h2>

      <div className="form-group">
        <label>Nazwa auta</label>

        <input
          type="text"
          placeholder="Np. Audi Nowe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Rejestracja</label>

        <input
          type="text"
          placeholder="Np. WA12345"
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Marka</label>

        <input
          type="text"
          placeholder="Np. Ford"
          value={make}
          onChange={(e) => setMake(e.target.value)}
        />
      </div>

    <div className="form-group">
        <label>Model</label>

        <input
          type="text"
          placeholder="Np. Focus"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Rok produkcji</label>

        <input
          type="number"
          placeholder="2026"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Zbiorniki</label>

        <div className="tank-options">
          <label>
            <input
              type="checkbox"
              checked={tanks.includes("petrol")}
              onChange={() => toggleTank("petrol")}
            />

            Benzyna
          </label>

          <label>
            <input
              type="checkbox"
              checked={tanks.includes("diesel")}
              onChange={() => toggleTank("diesel")}
            />

            Diesel
          </label>

          <label>
            <input
              type="checkbox"
              checked={tanks.includes("lpg")}
              onChange={() => toggleTank("lpg")}
            />

            LPG
          </label>
        </div>
      </div>

      <button type="submit">
        Dodaj auto
      </button>
    </form>
  )
}

export default CarForm