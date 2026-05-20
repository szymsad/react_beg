import { useState } from "react"
import "./CarPanel.css"
import type { Car } from "../types/Car"
import type { FuelEntry } from "../types/FuelEntry"
import CarForm from "./CarForm"
import ImportForm from "./ImportForm"

type Tab = "list" | "add" | "import"

interface Props {
  cars: Car[]
  onAddCar: (car: Car) => void
  onEditCar: (car: Car) => void
  onDeleteCar: (id: number) => void
  onImport: (entries: Omit<FuelEntry, "id">[], carId: number) => Promise<void>
}

function CarPanel({ cars, onAddCar, onEditCar, onDeleteCar, onImport }: Props) {
  const [tab, setTab] = useState<Tab>("list")
  const [editingCar, setEditingCar] = useState<Car | null>(null)

  function handleEdit(car: Car) {
    setEditingCar(car)
    setTab("list")
  }

  function handleEditSubmit(car: Car) {
    onEditCar(car)
    setEditingCar(null)
  }

  return (
    <div className="car-panel">
      <div className="car-panel__tabs">
        <button
          className={`car-panel__tab ${tab === "list" ? "car-panel__tab--active" : ""}`}
          onClick={() => { setTab("list"); setEditingCar(null) }}
        >
          🚗 Lista aut
        </button>
        <button
          className={`car-panel__tab ${tab === "add" ? "car-panel__tab--active" : ""}`}
          onClick={() => { setTab("add"); setEditingCar(null) }}
        >
          ➕ Dodaj auto
        </button>
        <button
          className={`car-panel__tab ${tab === "import" ? "car-panel__tab--active" : ""}`}
          onClick={() => { setTab("import"); setEditingCar(null) }}
        >
          📂 Import CSV
        </button>
      </div>

      <div className="car-panel__body">
        {tab === "list" && (
          <>
            {editingCar ? (
              <div>
                <div className="car-panel__edit-header">
                  <h3>Edytujesz: {editingCar.name}</h3>
                  <button className="car-panel__cancel" onClick={() => setEditingCar(null)}>
                    ✕ Anuluj
                  </button>
                </div>
                <CarForm initialCar={editingCar} onAdd={handleEditSubmit} />
              </div>
            ) : (
              <div className="car-panel__list">
                {cars.length === 0 && (
                  <p className="car-panel__empty">Brak aut. Dodaj pierwsze auto.</p>
                )}
                {cars.map(car => (
                  <div key={car.id} className="car-panel__car">
                    <div className="car-panel__car-info">
                      <strong>{car.name}</strong>
                      <span className="car-panel__car-meta">
                        {[car.make, car.model, car.year].filter(Boolean).join(" · ")}
                        {car.plate && ` · ${car.plate}`}
                      </span>
                      <span className="car-panel__car-tanks">
                        {car.tanks.map(t =>
                          t === "petrol" ? "⛽ Benzyna" :
                          t === "lpg" ? "🟢 LPG" : "🛢️ Diesel"
                        ).join("  ")}
                      </span>
                    </div>
                    <div className="car-panel__car-actions">
                      <button className="car-panel__btn-edit" onClick={() => handleEdit(car)}>
                        ✏️ Edytuj
                      </button>
                      <button className="car-panel__btn-delete"
                        onClick={() => {
                          if (confirm(`Usunąć ${car.name}? Usunie też wszystkie tankowania!`))
                            onDeleteCar(car.id)
                        }}>
                        🗑️ Usuń
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "add" && (
          <CarForm onAdd={(car) => { onAddCar(car); setTab("list") }} />
        )}

        {tab === "import" && (
          <ImportForm cars={cars} onImport={onImport} />
        )}
      </div>
    </div>
  )
}

export default CarPanel