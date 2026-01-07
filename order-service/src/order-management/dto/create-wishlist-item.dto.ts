import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWishlistItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;
}
