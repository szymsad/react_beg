import { useState } from "react"
import type { FuelEntry } from "../types/FuelEntry"

interface Props {
  onAdd: (entry: FuelEntry) => void
}

function FuelForm({ onAdd }: Props) {
  const [liters, setLiters] = useState("")
  const [price, setPrice] = useState("")
  const [mileage, setMileage] = useState("")
  const [date, setDate] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newEntry: FuelEntry = {
      id: Date.now(),
      date,
      liters: Number(liters),
      pricePerLiter: Number(price),
      mileage: Number(mileage)
    }

    onAdd(newEntry)

    // reset formularza
    setLiters("")
    setPrice("")
    setMileage("")
    setDate("")
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Dodaj tankowanie</h2>

      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Litry"
        value={liters}
        onChange={e => setLiters(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Cena za litr"
        value={price}
        onChange={e => setPrice(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Przebieg"
        value={mileage}
        onChange={e => setMileage(e.target.value)}
        required
      />

      <button type="submit">Dodaj</button>
    </form>
  )
}

export default FuelForm