import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateNoteDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  lessonId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  notes: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  second: number;
}
