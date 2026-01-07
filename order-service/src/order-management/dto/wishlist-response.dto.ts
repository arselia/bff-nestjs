import { Expose } from 'class-transformer';

export class WishlistResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  productId: string;
}
