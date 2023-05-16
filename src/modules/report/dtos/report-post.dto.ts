import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ReportPostDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  postId: number;
}
