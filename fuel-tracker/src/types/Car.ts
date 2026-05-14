export type FuelTankType = 'petrol' | 'lpg' | 'diesel'

export type Car = {
  id: number
  name: string
  make: string
  model?: string
  year: number
  plate?: string
  tanks: FuelTankType[]   
}