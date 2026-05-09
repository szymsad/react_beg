import "./FuelForm.css"
import { useState } from "react"
import type { FuelEntry, FuelType } from "../types/FuelEntry"
import { useCar } from "../context/CarContext"
import { mockCars } from "../data/mockData"

interface Props {
  onAdd: (entry: FuelEntry) => void
  initialEntry?: FuelEntry   // ← NOWE: tryb edycji
}

function getNow() {
  const now = new Date()
  return {
    date: now.toISOString().split("T")[0],
    time: now.toTimeString().slice(0, 5),
  }
}

function FuelForm({ onAdd, initialEntry }: Props) {
  const { selectedCarId } = useCar()
  const currentCar = mockCars.find(c => c.id === selectedCarId)
  const isEditing = !!initialEntry

  const { date: nowDate, time: nowTime } = getNow()

  // Inicjalizacja z initialEntry jeśli edytujemy
  const [date, setDate] = useState(initialEntry?.date ?? nowDate)
  const [time, setTime] = useState(initialEntry?.time ?? nowTime)
  const [fuelType, setFuelType] = useState<FuelType>(
    initialEntry?.fuelType ?? currentCar?.tanks[0] ?? "petrol"
  )
  const [liters, setLiters] = useState(initialEntry?.liters.toString() ?? "")
  const [pricePerLiter, setPricePerLiter] = useState(initialEntry?.pricePerLiter.toString() ?? "")
  const [totalCost, setTotalCost] = useState(initialEntry?.totalCost.toString() ?? "")
  const [mileage, setMileage] = useState(initialEntry?.mileage.toString() ?? "")
  const [isFullTank, setIsFullTank] = useState(initialEntry?.isFullTank ?? true)
  const [tankLevelAfter, setTankLevelAfter] = useState(initialEntry?.tankLevelAfter?.toString() ?? "")
  const [missedPreviousRefuel, setMissedPreviousRefuel] = useState(initialEntry?.missedPreviousRefuel ?? false)
  const [kmOnPetrol, setKmOnPetrol] = useState(initialEntry?.kmOnPetrol?.toString() ?? "")
  const [lastEdited, setLastEdited] = useState<"price" | "total">("price")

  const litersNum = Number(liters)
  const calculatedTotal =
    litersNum > 0 && Number(pricePerLiter) > 0
      ? (litersNum * Number(pricePerLiter)).toFixed(2) : ""
  const calculatedPrice =
    litersNum > 0 && Number(totalCost) > 0
      ? (Number(totalCost) / litersNum).toFixed(2) : ""

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

    const entry: FuelEntry = {
      id: initialEntry?.id ?? Date.now(),  // zachowaj id przy edycji
      carId: initialEntry?.carId ?? selectedCarId,
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

    onAdd(entry)

    if (!isEditing) {
      const { date: d, time: t } = getNow()
      setDate(d); setTime(t)
      setLiters(""); setPricePerLiter(""); setTotalCost(""); setMileage("")
      setIsFullTank(true); setTankLevelAfter(""); setMissedPreviousRefuel(false); setKmOnPetrol("")
    }
  }

  return (
    <form className="fuel-form" onSubmit={handleSubmit}>
      {!isEditing && <h2>Dodaj tankowanie</h2>}

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
        <input type="number" step="0.1" placeholder="Km przejechane na benzynie"
          value={kmOnPetrol} onChange={e => setKmOnPetrol(e.target.value)} />
      )}

      <label className="fuel-form__checkbox-label">
        <input type="checkbox" checked={missedPreviousRefuel} onChange={e => setMissedPreviousRefuel(e.target.checked)} />
        Pominięto poprzednie tankowanie (nie licz spalania)
      </label>

      <button type="submit" className="fuel-form__submit">
        {isEditing ? "Zapisz zmiany" : "Dodaj"}
      </button>
    </form>
  )
}

export default FuelForm