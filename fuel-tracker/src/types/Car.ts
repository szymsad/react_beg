export type FuelTankType = 'petrol' | 'lpg' | 'diesel'

export type Car = {
  id: number
  name: string
  plate?: string
  tanks: FuelTankType[]   
}