import { EntityRepository, Repository } from 'typeorm';
import { UserLesson } from '../entities/user-lesson.entity';

@EntityRepository(UserLesson)
export class UserLessonRepository extends Repository<UserLesson> {}
