import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PostStatus } from 'src/shares/enum/post.enum';

export class AdminGetBlogDto {
  @ApiProperty()
  @IsEnum(PostStatus)
  @IsNotEmpty()
  status: PostStatus;
}
