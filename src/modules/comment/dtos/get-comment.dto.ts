import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BasePaginationRequestDto } from 'src/shares/dtos/base-pagination.dto';

export class GetCommentDto extends BasePaginationRequestDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  postId: string;
}
