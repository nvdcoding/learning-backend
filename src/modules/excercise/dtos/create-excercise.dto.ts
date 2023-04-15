import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CreateTestcaseDto } from './create-testcase.dto';

export class CreateExcerciseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ type: [CreateTestcaseDto] })
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => CreateTestcaseDto)
  @ValidateNested({ each: true })
  testcases: CreateTestcaseDto[];
}
