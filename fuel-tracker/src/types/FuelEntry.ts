export type FuelEntry = {
  id: number
  carId: number        // ← DODAJ TO
  date: string
  liters: number
  pricePerLiter: number
  totalCost: number
  mileage: number
  note?: string        // ← opcjonalne, przyda się
}