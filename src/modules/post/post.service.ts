import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PermissionRepository } from 'src/models/repositories/permission.repository';
import { PostRepository } from 'src/models/repositories/post.repository';
import { UserRepository } from 'src/models/repositories/user.repository';
import {
  BasePaginationRequestDto,
  BasePaginationResponseDto,
} from 'src/shares/dtos/base-pagination.dto';
import { Path } from 'src/shares/enum/course.enum';
import { AdminAction, PostStatus, Topics } from 'src/shares/enum/post.enum';
import { UserStatus } from 'src/shares/enum/user.enum';
import { httpErrors } from 'src/shares/exceptions';
import { httpResponse } from 'src/shares/response';
import { Response } from 'src/shares/response/response.interface';
import { In, IsNull, Like, Not } from 'typeorm';
import { AdminGetBlogDto } from './dtos/admin-get-blog.dto';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { GetBlogDto } from './dtos/get-blog.dto';
import { AdminApproveRequest, UpdateBlogDto } from './dtos/update-post.dto';
import { UpdateStatusBlogDto } from './dtos/update-status-blog.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async userGetMyPost(
    options: BasePaginationRequestDto,
    userId: number,
  ): Promise<Response> {
    const user = await this.userRepository.findOne({
      where: { id: userId, verifyStatus: UserStatus.ACTIVE },
    });
    if (!user) {
      throw new HttpException(httpErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const posts = await this.postRepository.findAndCount({
      where: {
        status: In([PostStatus.ACTIVE, PostStatus.WAITING]),
        author: user,
      },
      relations: ['author', 'comments'],
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    });

    return {
      ...httpResponse.GET_SUCCESS,
      data: BasePaginationResponseDto.convertToPaginationWithTotalPages(
        posts,
        options.page || 1,
        options.limit || 10,
      ),
    };
  }

  async getPost(options: GetBlogDto): Promise<Response> {
    const { limit, page, topic, keyword } = options;
    const posts = await this.postRepository.findAndCount({
      where: {
        topic: topic ? topic : Not(IsNull()),
        status: In([PostStatus.ACTIVE, PostStatus.WAITING]),
        title: keyword ? Like(`%${keyword}%`) : Not(IsNull()),
      },
      order: {
        id: 'DESC',
      },
      relations: ['author'],
    });
    return {
      ...httpResponse.GET_SUCCESS,
      data: BasePaginationResponseDto.convertToPaginationWithTotalPages(
        posts,
        page || 1,
        limit || 10,
      ),
    };
  }

  async getOnePost(postId: number): Promise<Response> {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
        status: In([PostStatus.ACTIVE, PostStatus.WAITING]),
      },
      relations: ['author', 'comments'],
    });
    if (!post) {
      throw new HttpException(httpErrors.POST_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    delete post.author.password;
    return { ...httpResponse.GET_SUCCESS, data: post };
  }

  async adminGetOnePost(postId: number): Promise<Response> {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
      relations: ['author', 'comments', 'reports'],
    });
    if (!post) {
      throw new HttpException(httpErrors.POST_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    delete post.author.password;
    return { ...httpResponse.GET_SUCCESS, data: post };
  }

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
      currentContent: content,
      image: image ? image : null,
      status: PostStatus.PENDING,
      topic,
      updateContent: null,
      author: user,
    });
    return { ...httpResponse.CREATE_POST_SUCCESS };
  }

  async updatePost(body: UpdateBlogDto, userId: number): Promise<Response> {
    const { content, postId } = body;
    const [post, user] = await Promise.all([
      this.postRepository.findOne({
        where: {
          id: postId,
          status: PostStatus.ACTIVE,
        },
        relations: ['author'],
      }),
      this.userRepository.findOne({
        where: { id: userId, verifyStatus: UserStatus.ACTIVE },
      }),
    ]);
    if (!post) {
      throw new HttpException(httpErrors.POST_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (!user) {
      throw new HttpException(httpErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (post.author.id != user.id) {
      throw new HttpException(httpErrors.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    await this.postRepository.update(
      { id: post.id },
      { updateContent: content, status: PostStatus.WAITING },
    );

    return httpResponse.REQUEST_UPDATE_POST_SUCCESS;
  }

  async adminGetPostByStatus(options: AdminGetBlogDto): Promise<Response> {
    const { limit, page, status } = options;
    const posts = await this.postRepository.findAndCount({
      where: {
        status: status ? status : Not(IsNull()),
      },
      order: {
        id: 'DESC',
      },
      relations: ['author'],
    });
    return {
      ...httpResponse.GET_SUCCESS,
      data: BasePaginationResponseDto.convertToPaginationWithTotalPages(
        posts,
        page || 1,
        limit || 10,
      ),
    };
  }

  async adminUpdateStatusPost(body: UpdateStatusBlogDto) {
    const { postId, status } = body;
    if (![PostStatus.ACTIVE, PostStatus.REJECTED].includes(status)) {
      throw new HttpException(
        httpErrors.INVALID_PARAMS,
        HttpStatus.BAD_REQUEST,
      );
    }
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
    });
    if (!post) {
      throw new HttpException(httpErrors.POST_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    await this.postRepository.update({ id: postId }, { status });
    return httpResponse.APPROVE_POST_SUCCESS;
  }

  async adminApproveUpdateRequest(
    body: AdminApproveRequest,
  ): Promise<Response> {
    const { postId, action } = body;
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
        status: PostStatus.WAITING,
      },
    });
    if (!post) {
      throw new HttpException(httpErrors.POST_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    await this.postRepository.update(
      { id: post.id },
      {
        status: PostStatus.ACTIVE,
        currentContent:
          action === AdminAction.ACCEPT
            ? post.updateContent
            : post.currentContent,
        updateContent: null,
      },
    );
    return httpResponse.UPDATE_POST_SUCCESS;
  }

  async userDeletePost(postId: number, userId: number): Promise<Response> {
    const [post, user] = await Promise.all([
      this.postRepository.findOne({
        where: {
          id: postId,
        },
        relations: ['author'],
      }),
      this.userRepository.findOne({
        where: { id: userId, verifyStatus: UserStatus.ACTIVE },
      }),
    ]);
    if (!post) {
      throw new HttpException(httpErrors.POST_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (!user) {
      throw new HttpException(httpErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (userId != post.author.id) {
      throw new HttpException(httpErrors.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    await this.postRepository.softDelete(post.id);
    return httpResponse.DELETE_POST_SUCCESS;
  }

  async adminDeletePost(postId: number): Promise<Response> {
    const post = await this.postRepository.findOne(postId);
    if (!post) {
      throw new HttpException(httpErrors.POST_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // send mail
    await this.postRepository.softDelete(post.id);
    return httpResponse.DELETE_POST_SUCCESS;
  }

  async getPreferPost(userId: number): Promise<Response> {
    const user = await this.userRepository.findOne({
      where: { id: userId, verifyStatus: UserStatus.ACTIVE },
      relations: ['userPrefer'],
    });
    const postMap = user.userPrefer;
    const path = [];
    if (postMap.topicBackend) {
      path.push(Topics.BACKEND);
    }
    if (postMap.topicBasic) {
      path.push(Topics.BASIC);
    }
    if (postMap.topicFrontEnd) {
      path.push(Topics.FRONTEND);
    }
    if (postMap.topicMobile) {
      path.push(Topics.MOBILE);
    }
    if (postMap.topicsDevops) {
      path.push(Topics.DEVOPS);
    }
    if (postMap.topicOther) {
      path.push(Path.OTHER);
    }
    const data = await this.postRepository.find({
      where: {
        topic: In(path),
      },
      order: {
        id: 'DESC',
      },
    });

    return { ...httpResponse.GET_SUCCESS, data };
  }
}
