import { useState } from "react"
import type { FuelEntry, FuelType } from "../types/FuelEntry"
import { useCar } from "../context/CarContext"
import { mockCars } from "../data/mockData"

interface Props {
  onAdd: (entry: FuelEntry) => void
}

// Pomocnicza funkcja do pobrania aktualnej daty i czasu
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
  const [fuelType, setFuelType] = useState<FuelType>(
    currentCar?.tanks[0] ?? 'petrol'
  )
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
      kmOnPetrol: fuelType === 'lpg' && kmOnPetrol ? Number(kmOnPetrol) : undefined,
    }

    onAdd(newEntry)

    // reset z zachowaniem aktualnej daty/czasu
    const { date: d, time: t } = getNow()
    setDate(d); setTime(t)
    setLiters(""); setPricePerLiter(""); setTotalCost(""); setMileage("")
    setIsFullTank(true); setTankLevelAfter(""); setMissedPreviousRefuel(false); setKmOnPetrol("")
  }

  const fuelLabels: Record<FuelType, string> = {
    petrol: '⛽ Benzyna',
    lpg: '🟢 LPG',
    diesel: '🛢️ Diesel',
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Dodaj tankowanie</h2>

      {/* WYBÓR PALIWA */}
      {currentCar && currentCar.tanks.length > 1 && (
        <div>
          <label>Paliwo:</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            {currentCar.tanks.map(tank => (
              <button
                key={tank}
                type="button"
                onClick={() => setFuelType(tank)}
                style={{
                  background: fuelType === tank ? '#2563eb' : '#e5e7eb',
                  color: fuelType === tank ? 'white' : 'black',
                  flex: 1,
                }}
              >
                {fuelLabels[tank]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DATA + CZAS */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
          style={{ flex: 2 }}
        />
        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          required
          style={{ flex: 1 }}
        />
      </div>

      {/* PRZEBIEG */}
      <input
        type="number"
        placeholder="Przebieg (km)"
        value={mileage}
        onChange={e => setMileage(e.target.value)}
        required
      />

      {/* LITRY */}
      <input
        type="number"
        step="0.01"
        placeholder="Litry"
        value={liters}
        onChange={e => setLiters(e.target.value)}
        required
      />

      {/* CENA ZA LITR */}
      <input
        type="number"
        step="0.01"
        placeholder="Cena za litr"
        value={lastEdited === "total" ? calculatedPrice : pricePerLiter}
        onChange={e => { setLastEdited("price"); setPricePerLiter(e.target.value) }}
        required
      />

      {/* KOSZT CAŁKOWITY */}
      <input
        type="number"
        step="0.01"
        placeholder="Koszt całkowity"
        value={lastEdited === "price" ? calculatedTotal : totalCost}
        onChange={e => { setLastEdited("total"); setTotalCost(e.target.value) }}
        required
      />

      {/* DO PEŁNA */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
        <input
          type="checkbox"
          checked={isFullTank}
          onChange={e => setIsFullTank(e.target.checked)}
          style={{ width: 'auto' }}
        />
        Tankowanie do pełna
      </label>

      {/* POZIOM ZBIORNIKA — tylko jeśli nie do pełna */}
      {!isFullTank && (
        <input
          type="number"
          step="0.1"
          placeholder="Ile litrów w zbiorniku po tankowaniu"
          value={tankLevelAfter}
          onChange={e => setTankLevelAfter(e.target.value)}
        />
      )}

      {/* KM NA BENZYNIE — tylko dla LPG */}
      {fuelType === 'lpg' && (
        <input
          type="number"
          step="0.1"
          placeholder="Km przejechane na benzynie (gdy skończył się gaz)"
          value={kmOnPetrol}
          onChange={e => setKmOnPetrol(e.target.value)}
        />
      )}

      {/* POMINIĘTO POPRZEDNIE TANKOWANIE */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
        <input
          type="checkbox"
          checked={missedPreviousRefuel}
          onChange={e => setMissedPreviousRefuel(e.target.checked)}
          style={{ width: 'auto' }}
        />
        Pominięto poprzednie tankowanie (nie licz spalania)
      </label>

      <button type="submit">Dodaj</button>
    </form>
  )
}

export default FuelForm