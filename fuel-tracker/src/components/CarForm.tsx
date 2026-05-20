import { useState } from "react"
import "./CarForm.css"
import type { Car, FuelTankType } from "../types/Car"

interface Props {
  onAdd: (car: Car) => void
  initialCar?: Car
}

function CarForm({ onAdd, initialCar }: Props) {
  const [name, setName] = useState(initialCar?.name ?? "")
  const [plate, setPlate] = useState(initialCar?.plate ?? "")
  const [make, setMake] = useState(initialCar?.make ?? "")
  const [model, setModel] = useState(initialCar?.model ?? "")
  const [year, setYear] = useState(initialCar?.year?.toString() ?? "")
  const [tanks, setTanks] = useState<FuelTankType[]>(initialCar?.tanks ?? [])

  function toggleTank(tank: FuelTankType) {
    setTanks(prev =>
      prev.includes(tank) ? prev.filter(t => t !== tank) : [...prev, tank]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (tanks.length === 0) {
      alert("Wybierz przynajmniej jeden zbiornik")
      return
    }
    onAdd({
      id: initialCar?.id ?? Date.now(),
      name,
      plate,
      make,
      model,
      year: Number(year),
      tanks,
    })
  }

  return (
    <form className="car-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Nazwa auta</label>
        <input type="text" placeholder="Np. Audi A4" value={name}
          onChange={e => setName(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Rejestracja</label>
        <input type="text" placeholder="Np. WA12345" value={plate}
          onChange={e => setPlate(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Marka</label>
        <input type="text" placeholder="Np. Ford" value={make}
          onChange={e => setMake(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Model</label>
        <input type="text" placeholder="Np. Focus" value={model}
          onChange={e => setModel(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Rok produkcji</label>
        <input type="number" placeholder="2024" value={year}
          onChange={e => setYear(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Zbiorniki</label>
        <div className="tank-options">
          {(["petrol", "diesel", "lpg"] as FuelTankType[]).map(tank => (
            <label key={tank}>
              <input type="checkbox" checked={tanks.includes(tank)}
                onChange={() => toggleTank(tank)} />
              {tank === "petrol" ? "Benzyna" : tank === "diesel" ? "Diesel" : "LPG"}
            </label>
          ))}
        </div>
      </div>
      <button type="submit">
        {initialCar ? "Zapisz zmiany" : "Dodaj auto"}
      </button>
    </form>
  )
}

export default CarForm