import { useState, useEffect } from "react"
import type { FuelEntry } from "../types/FuelEntry"
import type { Car } from "../types/Car"

interface Props {
  onAdd: (entry: FuelEntry) => void
  carId: number
}
function FuelForm({ onAdd, carId }: Props) {

  const [date, setDate] = useState("")
  const [liters, setLiters] = useState("")
  const [mileage, setMileage] = useState("")

  const [mode, setMode] = useState<"price" | "total">("price")

  const [pricePerLiter, setPricePerLiter] = useState("")
  const [totalCost, setTotalCost] = useState("")

  function normalizeFuelData(
    liters: number,
    pricePerLiter?: number,
    totalCost?: number
  ) {
    if (pricePerLiter != null) {
      return {
        pricePerLiter,
        totalCost: liters * pricePerLiter,
      }
    }

    if (totalCost != null) {
      return {
        pricePerLiter: totalCost / liters,
        totalCost,
      }
    }

    return {
      pricePerLiter: 0,
      totalCost: 0,
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const litersNum = Number(liters)
    const mileageNum = Number(mileage)

    const normalized = normalizeFuelData(
      litersNum,
      mode === "price" ? Number(pricePerLiter) : undefined,
      mode === "total" ? Number(totalCost) : undefined
    )

    const newEntry: FuelEntry = {
      id: Date.now(),
      carId: carId,
      date,
      liters: litersNum,
      mileage: mileageNum,
      ...normalized,
    }

    onAdd(newEntry)

    // reset
    setLiters("")
    setMileage("")
    setDate("")
    setPricePerLiter("")
    setTotalCost("")
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Dodaj tankowanie</h2>

      {/* DATA */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      {/* LITRY */}
      <input
        type="number"
        placeholder="Litry"
        value={liters}
        onChange={(e) => setLiters(e.target.value)}
        required
      />

      {/* TRYB */}
      <div>
        <label>
          <input
            type="radio"
            checked={mode === "price"}
            onChange={() => setMode("price")}
          />
          Cena za litr
        </label>

        <label>
          <input
            type="radio"
            checked={mode === "total"}
            onChange={() => setMode("total")}
          />
          Koszt całkowity
        </label>
      </div>

      {mode === "price" ? (
        <input
          type="number"
          placeholder="Cena za litr"
          value={pricePerLiter}
          onChange={(e) => setPricePerLiter(e.target.value)}
        />
      ) : (
        <input
          type="number"
          placeholder="Koszt całkowity"
          value={totalCost}
          onChange={(e) => setTotalCost(e.target.value)}
        />
      )}

      {/* PRZEBIEG */}
      <input
        type="number"
        placeholder="Przebieg"
        value={mileage}
        onChange={(e) => setMileage(e.target.value)}
        required
      />

      <button type="submit">Dodaj tankowanie</button>
    </form>
  )
}

export default FuelForm