declare interface House {
  id: number
  address: string
  rental: number
  // 补充完整类型定义
  tenant?: Tenant
  paymentStatus: 'paid' | 'unpaid'
  maintenanceRequests: MaintenanceRequest[]
}

declare interface PaymentRecord {
  id: number
  amount: number
  paymentDate: string
  // ...其他字段
}

// 添加全局类型声明文件 