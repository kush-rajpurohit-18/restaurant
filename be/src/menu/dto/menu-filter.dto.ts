import { IsOptional, IsString } from 'class-validator';

export class MenuFilterDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() categorySlug?: string;
  @IsOptional() minPrice?: number;
  @IsOptional() maxPrice?: number;
  @IsOptional() @IsString() isVegetarian?: string;
  @IsOptional() @IsString() isVegan?: string;
  @IsOptional() @IsString() isGlutenFree?: string;
  @IsOptional() @IsString() isAvailable?: string;
}
