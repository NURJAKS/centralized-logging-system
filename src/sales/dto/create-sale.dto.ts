import { IsNumber, Min } from 'class-validator';
export class CreateSaleDto {
  @IsNumber()
  @Min(1)
  userId!: number;

  @IsNumber()
  @Min(1)
  productId!: number;
}
