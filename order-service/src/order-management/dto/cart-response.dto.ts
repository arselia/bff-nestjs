import { Expose } from 'class-transformer';

export class CartResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  productId: string;

  @Expose()
  quantity: number;

  @Expose()
  price: number;

  constructor(partial: Partial<CartResponseDto>) {
    Object.assign(this, partial);
  }
}
