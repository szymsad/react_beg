import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"

type CarContextType = {
  selectedCarId: number | null
  setSelectedCarId: (id: number | null) => void
}

const CarContext = createContext<CarContextType | null>(null)


export function CarProvider({ children }: { children: ReactNode }) {
  const [selectedCarId, setSelectedCarId] = useState<number | null>(1)
  //                                                              ^ domyślnie pierwsze auto

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