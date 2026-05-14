import { useEffect, useMemo, useState } from "react"
import "./FuelForm.css"

import type { FuelEntry, FuelType } from "../types/FuelEntry"
import type { Car } from "../types/Car"

import { useCar } from "../context/CarContext"

interface Props {
  onAdd: (entry: FuelEntry) => void
  cars: Car[]
  initialEntry?: FuelEntry
}

function FuelForm({ onAdd, cars, initialEntry }: Props) {
  const { selectedCarId } = useCar()

  const currentCar = useMemo(() => {
    return cars.find(car => car.id === selectedCarId)
  }, [cars, selectedCarId])

  const now = new Date()

  const defaultDate = now.toISOString().split("T")[0]

  const defaultTime = now.toTimeString().slice(0, 5)

  const [fuelType, setFuelType] = useState<FuelType>(
    initialEntry?.fuelType ??
      (currentCar?.tanks[0] as FuelType) ??
      "petrol"
  )

  const [date, setDate] = useState(
    initialEntry?.date ?? defaultDate
  )

  const [time, setTime] = useState(
    initialEntry?.time ?? defaultTime
  )

  const [liters, setLiters] = useState(
    initialEntry?.liters.toString() ?? ""
  )

  const [pricePerLiter, setPricePerLiter] = useState(
    initialEntry?.pricePerLiter.toString() ?? ""
  )

  const [totalCost, setTotalCost] = useState(
    initialEntry?.totalCost.toString() ?? ""
  )

  const [mileage, setMileage] = useState(
    initialEntry?.mileage.toString() ?? ""
  )

  const [isFullTank, setIsFullTank] = useState(
    initialEntry?.isFullTank ?? true
  )

  const [tankLevelAfter, setTankLevelAfter] = useState(
    initialEntry?.tankLevelAfter?.toString() ?? ""
  )

  const [missedPreviousRefuel, setMissedPreviousRefuel] = useState(
    initialEntry?.missedPreviousRefuel ?? false
  )

  const [kmOnPetrol, setKmOnPetrol] = useState(
    initialEntry?.kmOnPetrol?.toString() ?? ""
  )

  const [note, setNote] = useState(
    initialEntry?.note ?? ""
  )

  useEffect(() => {
    if (!currentCar) return

    if (!currentCar.tanks.includes(fuelType)) {
      setFuelType(currentCar.tanks[0] as FuelType)
    }
  }, [currentCar, fuelType])

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

    if (!selectedCarId) return

    const newEntry: FuelEntry = {
      id: initialEntry?.id ?? Date.now(),
      carId: selectedCarId,
      fuelType,
      date,
      time,
      liters: Number(liters),
      pricePerLiter: Number(pricePerLiter),
      totalCost: Number(totalCost),
      mileage: Number(mileage),
      isFullTank,
      missedPreviousRefuel,
      note: note || undefined,

      ...(tankLevelAfter && {
        tankLevelAfter: Number(tankLevelAfter),
      }),

      ...(kmOnPetrol && {
        kmOnPetrol: Number(kmOnPetrol),
      }),
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

      const freshNow = new Date()

      setDate(freshNow.toISOString().split("T")[0])
      setTime(freshNow.toTimeString().slice(0, 5))
    }
  }

  return (
    <form className="fuel-form" onSubmit={handleSubmit}>
      <h2>
        {initialEntry ? "Edytuj tankowanie" : "Dodaj tankowanie"}
      </h2>

      <div className="form-group">
        <label>Paliwo</label>

        <select
          value={fuelType}
          onChange={(e) => setFuelType(e.target.value as FuelType)}
        >
          {currentCar?.tanks.map(tank => (
            <option key={tank} value={tank}>
              {tank.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Data</label>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Godzina</label>

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Litry</label>

        <input
          type="number"
          step="0.01"
          value={liters}
          onChange={(e) => handleLitersChange(e.target.value)}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Cena za litr</label>

          <input
            type="number"
            step="0.01"
            value={pricePerLiter}
            onChange={(e) => handlePriceChange(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Koszt całkowity</label>

          <input
            type="number"
            step="0.01"
            value={totalCost}
            onChange={(e) => handleTotalCostChange(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Przebieg</label>

        <input
          type="number"
          value={mileage}
          onChange={(e) => setMileage(e.target.value)}
          required
        />
      </div>

      <div className="checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={isFullTank}
            onChange={(e) => setIsFullTank(e.target.checked)}
          />

          Tankowanie do pełna
        </label>
      </div>

      {!isFullTank && (
        <div className="form-group">
          <label>Stan zbiornika po tankowaniu (%)</label>

          <input
            type="number"
            min="0"
            max="100"
            value={tankLevelAfter}
            onChange={(e) => setTankLevelAfter(e.target.value)}
          />
        </div>
      )}

      <div className="checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={missedPreviousRefuel}
            onChange={(e) =>
              setMissedPreviousRefuel(e.target.checked)
            }
          />

          Pominięto poprzednie tankowanie
        </label>
      </div>

      {fuelType === "lpg" && (
        <div className="form-group">
          <label>KM przejechane na benzynie</label>

          <input
            type="number"
            value={kmOnPetrol}
            onChange={(e) => setKmOnPetrol(e.target.value)}
          />
        </div>
      )}

      <div className="form-group">
        <label>Notatka</label>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <button type="submit">
        {initialEntry ? "Zapisz zmiany" : "Dodaj tankowanie"}
      </button>
    </form>
  )
}

export default FuelForm