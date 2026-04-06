import { IsString, IsIn, IsOptional } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(['RECEIVED', 'PREPARING', 'READY', 'COMPLETED'])
  status: string;

  @IsOptional()
  @IsString()
  note?: string;
}
