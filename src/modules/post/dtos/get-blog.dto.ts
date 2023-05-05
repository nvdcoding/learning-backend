import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { BasePaginationRequestDto } from 'src/shares/dtos/base-pagination.dto';
import { Topics } from 'src/shares/enum/post.enum';

export class GetBlogDto extends BasePaginationRequestDto {
  @ApiProperty()
  @IsEnum(Topics)
  @IsOptional()
  topic: Topics;
}
