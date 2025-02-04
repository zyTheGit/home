export interface UserInfo {
  id: number
  username: string
  role: string
}

export interface House {
  id: number
  title: string
  address: string
  baseRent: number
  waterRate: number
  electricityRate: number
  area: number
  status: 'available' | 'rented' | 'maintenance'
  description?: string
  amenities: string[]
}

export interface Tenant {
  id: number
  name: string
  phone: string
  idCard: string
  checkInDate: string
  checkOutDate?: string
  house?: House
  houseId?: number
}

export interface Statistics {
  totalIncome: number
  monthlyIncome: number
  totalHouses: number
  occupancyRate: number
  pendingPayments: number
  monthlyTrend: {
    month: string
    income: number
  }[]
} 