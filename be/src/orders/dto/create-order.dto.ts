import { IsArray, ValidateNested, IsString, IsNumber, IsOptional, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString() menuItemId: string;
  @IsNumber() @Min(1) quantity: number;
  @IsOptional() @IsIn(['SMALL', 'MEDIUM', 'LARGE']) size?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) addOnIds?: string[];
  @IsOptional() @IsString() specialInstructions?: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
