import "./FuelForm.css"
import { useState } from "react"
import type { FuelEntry, FuelType } from "../types/FuelEntry"
import { useCar } from "../context/CarContext"
import { mockCars } from "../data/mockData"

interface Props {
  onAdd: (entry: FuelEntry) => void
}

function getNow() {
  const now = new Date()
  const date = now.toISOString().split("T")[0]
  const time = now.toTimeString().slice(0, 5)
  return { date, time }
}

function FuelForm({ onAdd }: Props) {
  const { selectedCarId } = useCar()
  const currentCar = mockCars.find(c => c.id === selectedCarId)

  const { date: nowDate, time: nowTime } = getNow()

  const [date, setDate] = useState(nowDate)
  const [time, setTime] = useState(nowTime)
  const [fuelType, setFuelType] = useState<FuelType>(currentCar?.tanks[0] ?? "petrol")
  const [liters, setLiters] = useState("")
  const [pricePerLiter, setPricePerLiter] = useState("")
  const [totalCost, setTotalCost] = useState("")
  const [mileage, setMileage] = useState("")
  const [isFullTank, setIsFullTank] = useState(true)
  const [tankLevelAfter, setTankLevelAfter] = useState("")
  const [missedPreviousRefuel, setMissedPreviousRefuel] = useState(false)
  const [kmOnPetrol, setKmOnPetrol] = useState("")
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

  const fuelLabels: Record<FuelType, string> = {
    petrol: "⛽ Benzyna",
    lpg: "🟢 LPG",
    diesel: "🛢️ Diesel",
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCarId) return

    const finalPrice = lastEdited === "price" ? Number(pricePerLiter) : Number(calculatedPrice)
    const finalTotal = lastEdited === "total" ? Number(totalCost) : Number(calculatedTotal)

    const newEntry: FuelEntry = {
      id: Date.now(),
      carId: selectedCarId,
      fuelType,
      date,
      time,
      liters: litersNum,
      pricePerLiter: finalPrice,
      totalCost: finalTotal,
      mileage: Number(mileage),
      isFullTank,
      tankLevelAfter: !isFullTank && tankLevelAfter ? Number(tankLevelAfter) : undefined,
      missedPreviousRefuel,
      kmOnPetrol: fuelType === "lpg" && kmOnPetrol ? Number(kmOnPetrol) : undefined,
    }

    onAdd(newEntry)

    const { date: d, time: t } = getNow()
    setDate(d); setTime(t)
    setLiters(""); setPricePerLiter(""); setTotalCost(""); setMileage("")
    setIsFullTank(true); setTankLevelAfter(""); setMissedPreviousRefuel(false); setKmOnPetrol("")
  }

  return (
    <form className="fuel-form" onSubmit={handleSubmit}>
      <h2>Dodaj tankowanie</h2>

      {currentCar && currentCar.tanks.length > 1 && (
        <div className="fuel-form__fuel-selector">
          <label>Paliwo:</label>
          <div className="fuel-form__fuel-buttons">
            {currentCar.tanks.map(tank => (
              <button
                key={tank}
                type="button"
                className={`fuel-form__fuel-btn ${fuelType === tank ? "fuel-form__fuel-btn--active" : ""}`}
                onClick={() => setFuelType(tank)}
              >
                {fuelLabels[tank]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="fuel-form__row">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
      </div>

      <input type="number" placeholder="Przebieg (km)" value={mileage} onChange={e => setMileage(e.target.value)} required />
      <input type="number" step="0.01" placeholder="Litry" value={liters} onChange={e => setLiters(e.target.value)} required />

      <input
        type="number" step="0.01" placeholder="Cena za litr"
        value={lastEdited === "total" ? calculatedPrice : pricePerLiter}
        onChange={e => { setLastEdited("price"); setPricePerLiter(e.target.value) }}
        required
      />
      <input
        type="number" step="0.01" placeholder="Koszt całkowity"
        value={lastEdited === "price" ? calculatedTotal : totalCost}
        onChange={e => { setLastEdited("total"); setTotalCost(e.target.value) }}
        required
      />

      <label className="fuel-form__checkbox-label">
        <input type="checkbox" checked={isFullTank} onChange={e => setIsFullTank(e.target.checked)} />
        Tankowanie do pełna
      </label>

      {!isFullTank && (
        <input type="number" step="0.1" placeholder="Ile litrów w zbiorniku po tankowaniu"
          value={tankLevelAfter} onChange={e => setTankLevelAfter(e.target.value)} />
      )}

      {fuelType === "lpg" && (
        <input type="number" step="0.1" placeholder="Km przejechane na benzynie (gdy skończył się gaz)"
          value={kmOnPetrol} onChange={e => setKmOnPetrol(e.target.value)} />
      )}

      <label className="fuel-form__checkbox-label">
        <input type="checkbox" checked={missedPreviousRefuel} onChange={e => setMissedPreviousRefuel(e.target.checked)} />
        Pominięto poprzednie tankowanie (nie licz spalania)
      </label>

      <button type="submit" className="fuel-form__submit">Dodaj</button>
    </form>
  )
}

export default FuelForm