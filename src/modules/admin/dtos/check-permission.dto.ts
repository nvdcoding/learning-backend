import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { AdminStatus } from 'src/shares/enum/admin.enum';

export class CheckPermissionDto {
  @IsBoolean()
  @IsNotEmpty()
  post: boolean;

  @IsBoolean()
  @IsNotEmpty()
  report: boolean;

  @IsBoolean()
  @IsNotEmpty()
  user: boolean;

  @IsBoolean()
  @IsNotEmpty()
  exercise: boolean;

  @IsBoolean()
  @IsNotEmpty()
  lesson: boolean;

  @IsBoolean()
  @IsNotEmpty()
  course: boolean;
}
