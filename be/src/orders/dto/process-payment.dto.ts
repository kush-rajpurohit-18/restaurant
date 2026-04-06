import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class ProcessPaymentDto {
  @IsString() cardNumber: string;
  @IsString() expiryDate: string;
  @IsString() cvv: string;
  @IsString() cardholderName: string;
  @IsOptional() @IsBoolean() mockFail?: boolean;
}
