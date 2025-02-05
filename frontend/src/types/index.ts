export interface UserInfo {
  id: number
  username: string
  phone: string
  role: 'admin' | 'user'
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
  startDate: string
  endDate?: string
  house?: House
  houseId?: number
}

export interface Statistics {
  totalHouses: number
  rentedHouses: number
  availableHouses: number
  occupancyRate: string
  totalIncome: number
  totalTenants: number
  monthlyStats?: {
    rent: number
    water: number
    electricity: number
    other: number
    total: number
  }
}

export interface LoginResponse {
  token: string
  user: UserInfo
}

export interface Payment {
  id: number
  type: 'rent' | 'water' | 'electricity' | 'other'
  amount: number
  date: string
  remark?: string
  houseId: number
  createdAt: string
} 