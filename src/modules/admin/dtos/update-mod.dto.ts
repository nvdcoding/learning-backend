import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { AdminStatus } from 'src/shares/enum/admin.enum';

export class AdminUpdateMod {
  @ApiProperty()
  @IsEnum(AdminStatus)
  @IsNotEmpty()
  status: AdminStatus;

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  modId: number;

  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  level: number;
}
