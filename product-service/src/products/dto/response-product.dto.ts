import { Expose } from 'class-transformer';

export class ProductResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  price: number;

  @Expose()
  stock: number;

  @Expose()
  category: string;

  @Expose()
  imageUrl: string;
}
