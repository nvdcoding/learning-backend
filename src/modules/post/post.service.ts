import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PermissionRepository } from 'src/models/repositories/permission.repository';
import { PostRepository } from 'src/models/repositories/post.repository';
import { UserRepository } from 'src/models/repositories/user.repository';
import { PostStatus } from 'src/shares/enum/post.enum';
import { UserStatus } from 'src/shares/enum/user.enum';
import { httpErrors } from 'src/shares/exceptions';
import { httpResponse } from 'src/shares/response';
import { Response } from 'src/shares/response/response.interface';
import { CreateBlogDto } from './dtos/create-blog.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createPost(body: CreateBlogDto, userId: number): Promise<Response> {
    const { content, title, image, topic } = body;
    const [post, user] = await Promise.all([
      this.postRepository.findOne({
        title,
      }),
      this.userRepository.findOne({
        where: {
          id: userId,
          verifyStatus: UserStatus.ACTIVE,
        },
      }),
    ]);
    if (post) {
      throw new HttpException(httpErrors.POST_EXISTED, HttpStatus.FOUND);
    }
    if (!user) {
      throw new HttpException(httpErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    await this.postRepository.insert({
      title,
      content,
      image: image ? image : null,
      status: PostStatus.PENDING,
      topic,
    });
    return { ...httpResponse.CREATE_POST_SUCCESS };
  }
}
