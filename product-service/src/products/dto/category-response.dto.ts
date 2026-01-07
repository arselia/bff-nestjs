import { Expose } from 'class-transformer';

export class CategoryResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  constructor(partial: Partial<CategoryResponseDto>) {
    Object.assign(this, partial);
  }
}