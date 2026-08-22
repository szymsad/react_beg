import { useEffect, useMemo, useState } from "react"
import "./FuelForm.css"

import type { FuelEntry, FuelType, FuelVariant } from "../types/FuelEntry"
import type { Car } from "../types/Car"

import { useCar } from "../context/CarContext"

interface Props {
  onAdd: (entry: FuelEntry) => void
  cars: Car[]
  initialEntry?: FuelEntry
}

// Konkretne warianty paliwa do wyboru w formularzu.
// Kolejność w tej tablicy = kolejność w <select> (stąd LPG jest pierwsze).
type FuelOption = {
  value: string
  label: string
  fuelType: FuelType
  fuelVariant?: FuelVariant
}

const FUEL_OPTIONS: FuelOption[] = [
  { value: "lpg", label: "LPG", fuelType: "lpg" },
  { value: "pb95", label: "PB95", fuelType: "petrol", fuelVariant: "pb95" },
  { value: "pb98", label: "PB98", fuelType: "petrol", fuelVariant: "pb98" },
  { value: "diesel", label: "Diesel", fuelType: "diesel", fuelVariant: "diesel" },
  { value: "diesel_plus", label: "Diesel+", fuelType: "diesel", fuelVariant: "diesel_plus" },
]

// Dopasowuje istniejący wpis (tryb edycji) do jednej z opcji powyżej.
// Stare wpisy sprzed tej zmiany nie mają fuelVariant — wtedy zgadujemy
// najbardziej sensowny domyślny wariant po samym fuelType.
function resolveFuelOptionValue(entry: FuelEntry): string {
  if (entry.fuelVariant) {
    const exact = FUEL_OPTIONS.find(opt => opt.fuelVariant === entry.fuelVariant)
    if (exact) return exact.value
  }
  if (entry.fuelType === "lpg") return "lpg"
  if (entry.fuelType === "diesel") return "diesel"
  return "pb95"
}

function FuelForm({ onAdd, cars, initialEntry }: Props) {
  const { selectedCarId } = useCar()

  const currentCar = useMemo(() => {
    return cars.find(car => car.id === selectedCarId)
  }, [cars, selectedCarId])

  // Warianty dostępne dla wybranego auta, w kolejności z FUEL_OPTIONS.
  const availableFuelOptions = useMemo(() => {
    if (!currentCar) return []
    return FUEL_OPTIONS.filter(opt => currentCar.tanks.includes(opt.fuelType))
  }, [currentCar])

  const now = new Date()
  const defaultDate = now.toISOString().split("T")[0]
  const defaultTime = now.toTimeString().slice(0, 5)

  const [selectedFuel, setSelectedFuel] = useState<string>(() => {
    if (initialEntry) return resolveFuelOptionValue(initialEntry)
    return availableFuelOptions[0]?.value ?? "lpg"
  })

  const [date, setDate] = useState(initialEntry?.date ?? defaultDate)
  const [time, setTime] = useState(initialEntry?.time ?? defaultTime)
  const [liters, setLiters] = useState(initialEntry?.liters.toString() ?? "")
  const [pricePerLiter, setPricePerLiter] = useState(initialEntry?.pricePerLiter.toString() ?? "")
  const [totalCost, setTotalCost] = useState(initialEntry?.totalCost.toString() ?? "")
  const [mileage, setMileage] = useState(initialEntry?.mileage.toString() ?? "")
  const [isFullTank, setIsFullTank] = useState(initialEntry?.isFullTank ?? true)
  const [tankLevelAfter, setTankLevelAfter] = useState(initialEntry?.tankLevelAfter?.toString() ?? "")
  const [missedPreviousRefuel, setMissedPreviousRefuel] = useState(initialEntry?.missedPreviousRefuel ?? false)
  const [kmOnPetrol, setKmOnPetrol] = useState(initialEntry?.kmOnPetrol?.toString() ?? "")
  const [note, setNote] = useState(initialEntry?.note ?? "")

  // Jeśli zmieni się auto (inne zbiorniki), a wybrany wariant przestał
  // być dostępny — przełącz na pierwszy dostępny (czyli znów LPG, jeśli jest).
  useEffect(() => {
    if (availableFuelOptions.length === 0) return
    const stillValid = availableFuelOptions.some(opt => opt.value === selectedFuel)
    if (!stillValid) {
      setSelectedFuel(availableFuelOptions[0].value)
    }
  }, [availableFuelOptions, selectedFuel])

  const selectedOption = FUEL_OPTIONS.find(opt => opt.value === selectedFuel)

  function handleLitersChange(value: string) {
    setLiters(value)
    const litersNum = Number(value)
    const priceNum = Number(pricePerLiter)
    if (litersNum > 0 && priceNum > 0) {
      setTotalCost((litersNum * priceNum).toFixed(2))
    }
  }

  function handlePriceChange(value: string) {
    setPricePerLiter(value)
    const litersNum = Number(liters)
    const priceNum = Number(value)
    if (litersNum > 0 && priceNum > 0) {
      setTotalCost((litersNum * priceNum).toFixed(2))
    }
  }

  function handleTotalCostChange(value: string) {
    setTotalCost(value)
    const litersNum = Number(liters)
    const totalNum = Number(value)
    if (litersNum > 0 && totalNum > 0) {
      setPricePerLiter((totalNum / litersNum).toFixed(2))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCarId || !selectedOption) return

    const newEntry: FuelEntry = {
      id: initialEntry?.id ?? Date.now(),
      carId: selectedCarId,
      fuelType: selectedOption.fuelType,
      fuelVariant: selectedOption.fuelVariant,
      date,
      time,
      liters: Number(liters),
      pricePerLiter: Number(pricePerLiter),
      totalCost: Number(totalCost),
      mileage: Number(mileage),
      isFullTank,
      missedPreviousRefuel,
      note: note || undefined,

      ...(tankLevelAfter && { tankLevelAfter: Number(tankLevelAfter) }),
      ...(kmOnPetrol && { kmOnPetrol: Number(kmOnPetrol) }),
    }

    await onAdd(newEntry)

    if (!initialEntry) {
      setLiters("")
      setPricePerLiter("")
      setTotalCost("")
      setMileage("")
      setTankLevelAfter("")
      setKmOnPetrol("")
      setNote("")
      setIsFullTank(true)
      setMissedPreviousRefuel(false)
      setSelectedFuel(availableFuelOptions[0]?.value ?? "lpg")

      const freshNow = new Date()
      setDate(freshNow.toISOString().split("T")[0])
      setTime(freshNow.toTimeString().slice(0, 5))
    }
  }

  return (
    <form className="fuel-form" onSubmit={handleSubmit}>
      <h2>{initialEntry ? "Edytuj tankowanie" : "Dodaj tankowanie"}</h2>

      <div className="form-group">
        <label>Paliwo</label>
        <select value={selectedFuel} onChange={(e) => setSelectedFuel(e.target.value)}>
          {availableFuelOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Data</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Godzina</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </div>
      </div>

      <div className="form-group">
        <label>Litry</label>
        <input type="number" step="0.01" value={liters} onChange={(e) => handleLitersChange(e.target.value)} required />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Cena za litr</label>
          <input type="number" step="0.01" value={pricePerLiter} onChange={(e) => handlePriceChange(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Koszt całkowity</label>
          <input type="number" step="0.01" value={totalCost} onChange={(e) => handleTotalCostChange(e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label>Przebieg</label>
        <input type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} required />
      </div>

      <div className="checkbox-group">
        <label>
          <input type="checkbox" checked={isFullTank} onChange={(e) => setIsFullTank(e.target.checked)} />
          Tankowanie do pełna
        </label>
      </div>

      {!isFullTank && (
        <div className="form-group">
          <label>Stan zbiornika po tankowaniu (%)</label>
          <input type="number" min="0" max="100" value={tankLevelAfter} onChange={(e) => setTankLevelAfter(e.target.value)} />
        </div>
      )}

      <div className="checkbox-group">
        <label>
          <input type="checkbox" checked={missedPreviousRefuel} onChange={(e) => setMissedPreviousRefuel(e.target.checked)} />
          Pominięto poprzednie tankowanie
        </label>
      </div>

      {selectedOption?.fuelType === "lpg" && (
        <div className="form-group">
          <label>KM przejechane na benzynie</label>
          <input type="number" value={kmOnPetrol} onChange={(e) => setKmOnPetrol(e.target.value)} />
        </div>
      )}

      <div className="form-group">
        <label>Notatka</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <button type="submit">{initialEntry ? "Zapisz zmiany" : "Dodaj tankowanie"}</button>
    </form>
  )
}

export default FuelForm