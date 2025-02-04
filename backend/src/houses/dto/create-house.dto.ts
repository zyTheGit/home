export class CreateHouseDto {
  title: string;
  address: string;
  price: number;
  area: number;
  status?: 'available' | 'rented';
  description?: string;
} 