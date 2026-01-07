import { IsNotEmpty, IsString, IsNumber, IsPositive } from 'class-validator';

export class CreateCartItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
}
