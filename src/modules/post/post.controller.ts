import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { Response } from 'src/shares/response/response.interface';
import { UserAuthGuard } from '../auth/guard/user-auth.guard';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { PostService } from './post.service';

@Controller('posts')
@ApiTags('Post')
@ApiBearerAuth()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('/')
  @UseGuards(UserAuthGuard)
  async createPost(
    @Body() body: CreateBlogDto,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.postService.createPost(body, userId);
  }
}
