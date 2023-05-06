import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BasePaginationRequestDto } from 'src/shares/dtos/base-pagination.dto';
import { PostStatus } from 'src/shares/enum/post.enum';

export class AdminGetBlogDto extends BasePaginationRequestDto {
  @ApiProperty()
  @IsEnum(PostStatus)
  @IsOptional()
  status: PostStatus;
}
