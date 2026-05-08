import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

type CarContextType = {
  selectedCarId: number | null
  setSelectedCarId: (id: number | null) => void
}

const CarContext = createContext<CarContextType | null>(null)

export function CarProvider({ children }: { children: ReactNode }) {
  const [selectedCarId, setSelectedCarIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem("selectedCar")
    return saved ? Number(saved) : 1
  })

  function setSelectedCarId(id: number | null) {
    setSelectedCarIdState(id)
    if (id !== null) {
      localStorage.setItem("selectedCar", String(id))
    } else {
      localStorage.removeItem("selectedCar")
    }
  }

  return (
    <CarContext.Provider value={{ selectedCarId, setSelectedCarId }}>
      {children}
    </CarContext.Provider>
  )
}

export function useCar() {
  const ctx = useContext(CarContext)
  if (!ctx) throw new Error("useCar musi być użyty wewnątrz CarProvider")
  return ctx
}