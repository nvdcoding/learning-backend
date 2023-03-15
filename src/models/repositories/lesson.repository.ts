import { EntityRepository, Repository } from 'typeorm';
import { Lesson } from '../entities/lesson.entity';

@EntityRepository(Lesson)
export class LessonRepository extends Repository<Lesson> {}
