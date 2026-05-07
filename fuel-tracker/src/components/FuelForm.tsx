import { useState } from "react"
import type { FuelEntry } from "../types/FuelEntry"
import { useCar } from "../context/CarContext"

interface Props {
  onAdd: (entry: FuelEntry) => void
}

function FuelForm({ onAdd }: Props) {
  const { selectedCarId } = useCar()

  const [liters, setLiters] = useState("")
  const [pricePerLiter, setPricePerLiter] = useState("")
  const [totalCost, setTotalCost] = useState("")
  const [mileage, setMileage] = useState("")
  const [date, setDate] = useState("")

  const [lastEdited, setLastEdited] = useState<"price" | "total">("price")

  const litersNum = Number(liters)

  const calculatedTotal =
    litersNum > 0 && Number(pricePerLiter) > 0
      ? (litersNum * Number(pricePerLiter)).toFixed(2)
      : ""

  const calculatedPrice =
    litersNum > 0 && Number(totalCost) > 0
      ? (Number(totalCost) / litersNum).toFixed(2)
      : ""

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedCarId) return

    const finalPricePerLiter =
      lastEdited === "price"
        ? Number(pricePerLiter)
        : Number(calculatedPrice)

    const finalTotalCost =
      lastEdited === "total"
        ? Number(totalCost)
        : Number(calculatedTotal)

    const newEntry: FuelEntry = {
      id: Date.now(),
      carId: selectedCarId,
      date,
      liters: Number(liters),
      pricePerLiter: finalPricePerLiter,
      totalCost: finalTotalCost,
      mileage: Number(mileage),
    }

    onAdd(newEntry)

    // RESET
    setLiters("")
    setPricePerLiter("")
    setTotalCost("")
    setMileage("")
    setDate("")
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
        step="0.01"
        placeholder="Litry"
        value={liters}
        onChange={(e) => setLiters(e.target.value)}
        required
      />

      {/* CENA ZA LITR */}
      <input
        type="number"
        step="0.01"
        placeholder="Cena za litr"
        value={
          lastEdited === "total"
            ? calculatedPrice
            : pricePerLiter
        }
        onChange={(e) => {
          setLastEdited("price")
          setPricePerLiter(e.target.value)
        }}
        required
      />

      {/* KOSZT CAŁKOWITY */}
      <input
        type="number"
        step="0.01"
        placeholder="Koszt całkowity"
        value={
          lastEdited === "price"
            ? calculatedTotal
            : totalCost
        }
        onChange={(e) => {
          setLastEdited("total")
          setTotalCost(e.target.value)
        }}
        required
      />

      {/* PRZEBIEG */}
      <input
        type="number"
        placeholder="Przebieg"
        value={mileage}
        onChange={(e) => setMileage(e.target.value)}
        required
      />

      <button type="submit">
        Dodaj
      </button>
    </form>
  )
}

export default FuelForm