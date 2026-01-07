import { IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Harga harus lebih besar dari 0' })
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Stok tidak boleh negatif' })
  stock?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
