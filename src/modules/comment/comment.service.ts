import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommentRepository } from 'src/models/repositories/comment.repository';
import { PostRepository } from 'src/models/repositories/post.repository';
import { UserRepository } from 'src/models/repositories/user.repository';
import { BasePaginationResponseDto } from 'src/shares/dtos/base-pagination.dto';
import { PostStatus } from 'src/shares/enum/post.enum';
import { UserStatus } from 'src/shares/enum/user.enum';
import { httpErrors } from 'src/shares/exceptions';
import { httpResponse } from 'src/shares/response';
import { Response } from 'src/shares/response/response.interface';
import { In } from 'typeorm';
import { CommentDto } from './dtos/comment.dto';
import { GetCommentDto } from './dtos/get-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly userRepository: UserRepository,
    private readonly postRepository: PostRepository,
  ) {}

  async createComment(body: CommentDto, userId: number): Promise<Response> {
    const { content, parrentCommentId, postId } = body;
    const [user, post] = await Promise.all([
      this.userRepository.findOne({
        where: {
          id: userId,
          verifyStatus: UserStatus.ACTIVE,
        },
      }),
      this.postRepository.findOne({
        where: {
          id: postId,
          status: In([PostStatus.ACTIVE, PostStatus.WAITING]),
        },
      }),
    ]);
    let parrentComment;
    if (parrentCommentId) {
      parrentComment = await this.commentRepository.findOne(parrentCommentId);
    }

    if (!user) {
      throw new HttpException(httpErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (!post) {
      throw new HttpException(httpErrors.POST_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    await this.commentRepository.insert({
      content,
      user,
      post,
      parrentComment: parrentComment ? parrentComment : null,
    });
    return httpResponse.CREATE_COMMENT_SUCCESS;
  }

  async getPostComment(options: GetCommentDto): Promise<Response> {
    const { postId, page, limit } = options;
    const post = await this.postRepository.findOne({
      where: {
        id: +postId,
        status: In([PostStatus.ACTIVE, PostStatus.WAITING]),
      },
    });
    if (!post) {
      throw new HttpException(httpErrors.POST_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const comment = await this.commentRepository.findAndCount({
      where: { post },
      relations: [
        'user',
        'post',
        'lesson',
        'parrentComment',
        'parrentComment.subcomments',
      ],
      take: options.limit,
      skip: (options.page - 1) * options.limit,
      order: {
        id: 'DESC',
      },
    });
    return {
      ...httpResponse.GET_COMMENT_SUCCESS,
      data: BasePaginationResponseDto.convertToPaginationWithTotalPages(
        comment,
        page,
        limit,
      ),
    };
  }

  async updateComment(body: UpdateCommentDto, userId: number) {
    const { commentId, content } = body;
    const user = await this.userRepository.findOne({
      id: userId,
      verifyStatus: UserStatus.ACTIVE,
    });
    if (!user) {
      throw new HttpException(httpErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const comment = await this.commentRepository.findOne({
      user,
      id: commentId,
    });
    if (!comment) {
      throw new HttpException(
        httpErrors.COMMENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    // Modify the comment properties
    comment.content = content;

    // Save the updated comment to the database
    const updatedComment = await this.commentRepository.save(comment);
    return httpResponse.UPDATE_COMMENT_SUCCESS;
  }

  async deleteComment(commentId: number, userId: number): Promise<Response> {
    const user = await this.userRepository.findOne({
      id: userId,
      verifyStatus: UserStatus.ACTIVE,
    });
    if (!user) {
      throw new HttpException(httpErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, user },
      relations: ['subcomments'],
    });
    if (!comment) {
      throw new HttpException(
        httpErrors.COMMENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    if (comment.subcomments && comment.subcomments.length > 0) {
      const subcommentIds = comment.subcomments.map(
        (subcomment) => subcomment.id,
      );
      await this.commentRepository.delete(subcommentIds);
    }
    await this.commentRepository.delete(comment.id);
    return httpResponse.DELETE_COMMENT_SUCCESS;
  }
}
