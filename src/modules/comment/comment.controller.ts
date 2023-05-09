import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { Response } from 'src/shares/response/response.interface';
import { IsLoginAuthGuard } from '../auth/guard/is-login.guard';
import { UserAuthGuard } from '../auth/guard/user-auth.guard';
import { CommentService } from './comment.service';
import { CommentDto } from './dtos/comment.dto';
import { GetCommentDto } from './dtos/get-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';

@Controller('comments')
@ApiTags('Comment')
@ApiBearerAuth()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/')
  @UseGuards(UserAuthGuard)
  async createComment(
    @Body() body: CommentDto,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.commentService.createComment(body, userId);
  }

  @Get('/')
  async getComment(@Query() options: GetCommentDto): Promise<Response> {
    return this.commentService.getPostComment(options);
  }

  @Put('/')
  @UseGuards(UserAuthGuard)
  async updateComment(
    @Body() body: UpdateCommentDto,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.commentService.updateComment(body, userId);
  }

  @Delete('/:id')
  @UseGuards(UserAuthGuard)
  async deleteComment(
    @Param('id') id: number,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.commentService.deleteComment(id, userId);
  }
}
