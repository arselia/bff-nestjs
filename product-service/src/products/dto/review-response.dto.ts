import { Expose } from 'class-transformer';

export class ReviewResponseDto {
  @Expose()
  id: string;

  @Expose()
  product: string;

  @Expose()
  userId: string;

  @Expose()
  rating: number;

  @Expose()
  comment: string;
}