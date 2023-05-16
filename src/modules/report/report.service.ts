import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Report } from 'src/models/entities/report.entity';
import { PostRepository } from 'src/models/repositories/post.repository';
import { ReportRepository } from 'src/models/repositories/report.repository';
import { UserRepository } from 'src/models/repositories/user.repository';
import { BasePaginationResponseDto } from 'src/shares/dtos/base-pagination.dto';
import { PostStatus } from 'src/shares/enum/post.enum';
import {
  GetReportStatus,
  HandleReportPostAction,
  ReportStatus,
} from 'src/shares/enum/report.enum';
import { UserStatus } from 'src/shares/enum/user.enum';
import { httpErrors } from 'src/shares/exceptions';
import { httpResponse } from 'src/shares/response';
import { Response } from 'src/shares/response/response.interface';
import { In, IsNull, Not } from 'typeorm';
import { GetReportDto } from './dtos/get-report.dto';
import { HandleReportPostDto } from './dtos/handle-report-post.dto';
import { ReportPostDto } from './dtos/report-post.dto';
@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async reportPost(body: ReportPostDto, userId: number): Promise<Response> {
    const { reason, postId } = body;
    const [post, user] = await Promise.all([
      this.postRepository.findOne({
        id: postId,
        status: In([PostStatus.ACTIVE, PostStatus.WAITING]),
      }),
      this.userRepository.findOne({
        where: {
          id: userId,
          verifyStatus: UserStatus.ACTIVE,
        },
      }),
    ]);
    if (!post) {
      throw new HttpException(httpErrors.POST_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (!user) {
      throw new HttpException(httpErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    await this.reportRepository.insert({
      reason,
      reportedBy: user,
      post,
    });

    return httpResponse.CREATE_REPORT_SUCCESS;
  }

  async getReportPost(options: GetReportDto): Promise<Response> {
    const { status, limit, page } = options;
    const where = {};
    if (status && status === GetReportStatus.PROCESSED) {
      where['status'] = ReportStatus.PROCESSED;
    } else if (status && status === GetReportStatus.PROCESSING) {
      where['status'] = In([ReportStatus.PENDING]);
    } else {
      where['status'] = Not(IsNull());
    }
    const reports = await this.reportRepository.findAndCount({
      where: {
        ...where,
        post: Not(IsNull()),
      },
      relations: ['post', 'reportedBy'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      ...httpResponse.GET_REPORT_SUCCESS,
      data: BasePaginationResponseDto.convertToPaginationWithTotalPages(
        reports,
        page,
        limit,
      ),
    };
  }

  async deleteReport(reportId: number): Promise<Response> {
    const report = await this.reportRepository.findOne({
      id: reportId,
    });
    if (!report) {
      throw new HttpException(
        httpErrors.REPORT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.reportRepository.delete(report.id);
    return httpResponse.DELETE_REPORT_SUCCESS;
  }

  async handleReportPost(body: HandleReportPostDto): Promise<Response> {
    const { action, reportId } = body;
    const report = await this.reportRepository.findOne({
      where: {
        id: reportId,
        post: Not(IsNull()),
      },
      relations: ['post', 'post.reports'],
    });
    if (!report) {
      throw new HttpException(
        httpErrors.REPORT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    if (action === HandleReportPostAction.SKIP) {
      await this.reportRepository.update(
        { id: reportId },
        { status: ReportStatus.PROCESSED },
      );
    } else {
      await Promise.all([
        this.reportRepository.update(
          { post: report.post },
          { status: ReportStatus.PROCESSED },
        ),
        this.postRepository.softDelete(report.post.id),
      ]);
    }
    return httpResponse.HANLED_REPORT;
  }
}
