import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class DepositDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
