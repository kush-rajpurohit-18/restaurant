import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CreateAddOnDto {
  @IsString() name: string;
  @IsNumber() @Min(0) price: number;
}

export class CreateMenuItemDto {
  @IsString() name: string;
  @IsString() description: string;
  @IsNumber() @Min(0) price: number;
  @IsString() categoryId: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsNumber() preparationTime?: number;
  @IsOptional() @IsBoolean() isAvailable?: boolean;
  @IsOptional() @IsBoolean() isVegetarian?: boolean;
  @IsOptional() @IsBoolean() isVegan?: boolean;
  @IsOptional() @IsBoolean() isGlutenFree?: boolean;
  @IsOptional() @IsNumber() stock?: number;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CreateAddOnDto) addOns?: CreateAddOnDto[];
}
