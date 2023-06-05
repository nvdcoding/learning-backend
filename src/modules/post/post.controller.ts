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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { PermissionLevel } from 'src/shares/decorators/level-permission.decorator';
import { BasePaginationRequestDto } from 'src/shares/dtos/base-pagination.dto';
import { Response } from 'src/shares/response/response.interface';
import { AdminService } from '../admin/admin.service';
import { AdminModAuthGuard } from '../auth/guard/admin-mod-auth-guard';
import { UserAuthGuard } from '../auth/guard/user-auth.guard';
import { AdminGetBlogDto } from './dtos/admin-get-blog.dto';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { GetBlogDto } from './dtos/get-blog.dto';
import { AdminApproveRequest, UpdateBlogDto } from './dtos/update-post.dto';
import { UpdateStatusBlogDto } from './dtos/update-status-blog.dto';
import { PostService } from './post.service';

@Controller('posts')
@ApiTags('Post')
@ApiBearerAuth()
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly adminService: AdminService,
  ) {}

  @Get('/user/:id')
  async getOnePost(@Param('id') id: number): Promise<Response> {
    return this.postService.getOnePost(id);
  }

  @Get('/get-user-post')
  @UseGuards(UserAuthGuard)
  async getUserPost(
    @Query() options: BasePaginationRequestDto,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.postService.userGetMyPost(options, userId);
  }

  @Get('/user')
  async getPost(@Query() options: GetBlogDto): Promise<Response> {
    return this.postService.getPost(options);
  }

  @Delete('/user/:id')
  @UseGuards(UserAuthGuard)
  async userDeletePost(
    @Param('id') postId: number,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.postService.userDeletePost(postId, userId);
  }

  @Post('/user')
  @UseGuards(UserAuthGuard)
  async createPost(
    @Body() body: CreateBlogDto,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.postService.createPost(body, userId);
  }

  @Put('/user')
  @UseGuards(UserAuthGuard)
  async updatePostContent(
    @Body() body: UpdateBlogDto,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.postService.updatePost(body, userId);
  }

  @Get('/admin')
  @UseGuards(AdminModAuthGuard)
  async adminGetPost(
    @Query() options: AdminGetBlogDto,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, {
      post: true,
    });
    return this.postService.adminGetPostByStatus(options);
  }

  @Get('/admin/:id')
  @UseGuards(AdminModAuthGuard)
  async adminGetOnePost(
    @Param('id') id: number,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, {
      post: true,
    });
    return this.postService.adminGetOnePost(id);
  }

  @Put('/admin/approve-update')
  @UseGuards(AdminModAuthGuard)
  async adminApproveUpdatePost(
    @Body() body: AdminApproveRequest,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, {
      post: true,
    });
    return this.postService.adminApproveUpdateRequest(body);
  }

  @Put('/admin')
  @UseGuards(AdminModAuthGuard)
  async adminApprovePost(
    @Body() body: UpdateStatusBlogDto,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, {
      post: true,
    });
    return this.postService.adminUpdateStatusPost(body);
  }

  @Delete('/admin/:id')
  @UseGuards(AdminModAuthGuard)
  async adminDeletePost(
    @Param('id') postId: number,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, {
      post: true,
    });
    return this.postService.adminDeletePost(postId);
  }

  @Get('/prefer')
  @UseGuards(UserAuthGuard)
  async getPreferPost(
    @UserID() userId: number,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, {
      post: true,
    });
    return this.postService.getPreferPost(userId);
  }
}
