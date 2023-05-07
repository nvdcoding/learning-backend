import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UserPreferDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  courseBasic: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  courseBackend: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  courseMobile: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  courseFrontend: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  courseFullstack: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  courseOther: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  topicBackend: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  topicFrontEnd: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  topicBasic: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  topicMobile: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  topicsDevops: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  topicOther: boolean;
}
