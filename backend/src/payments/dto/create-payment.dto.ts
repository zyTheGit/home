export class CreatePaymentDto {
  houseId: number;
  tenantId: number;
  amount: number;
  rentAmount: number;
  waterFee: number;
  electricityFee: number;
  discount: number;
  startDate: Date;
  endDate: Date;
  waterReading: number;
  electricityReading: number;
  notes?: string;
} 