export type FuelType = 'petrol' | 'lpg' | 'diesel'

export type FuelEntry = {
  id: number
  carId: number
  fuelType: FuelType
  date: string              // "2026-05-08"
  time: string              // "14:30"
  liters: number
  pricePerLiter: number
  totalCost: number
  mileage: number
  isFullTank: boolean
  tankLevelAfter?: number   // litry w zbiorniku jeśli nie do pełna
  missedPreviousRefuel: boolean  // pomija obliczanie spalania
  kmOnPetrol?: number       // dla LPG: ile km przejechano na benzynie
  note?: string
}