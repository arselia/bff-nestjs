import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  name: string;

  @IsPositive({ message: 'Harga harus lebih besar dari 0' })
  @IsNumber()
  price: number;

  @Min(0, { message: 'Stok tidak boleh negatif' })
  @IsNumber()
  stock: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  categoryId: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
