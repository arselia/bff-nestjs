import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export enum StockUpdateType {
  INCREASE = 'increase',
  DECREASE = 'decrease',
}

export class UpdateStockDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  quantity: number;

  @IsEnum(StockUpdateType)
  @IsNotEmpty()
  type: StockUpdateType;
}
