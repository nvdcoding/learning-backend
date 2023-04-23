import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class DoExerciseDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  exerciseId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  answer: string;
}
