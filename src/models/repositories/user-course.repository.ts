import { EntityRepository, Repository } from 'typeorm';
import { UserCourse } from '../entities/user-course.entity';

@EntityRepository(UserCourse)
export class UserCourseRepository extends Repository<UserCourse> {}
