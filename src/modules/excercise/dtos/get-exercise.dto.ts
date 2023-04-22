import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetExerciseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lessionId: number;
}
