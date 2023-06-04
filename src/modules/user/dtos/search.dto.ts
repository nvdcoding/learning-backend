import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { BasePaginationRequestDto } from 'src/shares/dtos/base-pagination.dto';

export class SearchDto extends BasePaginationRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  keyword: string;
}
