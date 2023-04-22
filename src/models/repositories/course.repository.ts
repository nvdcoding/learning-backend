import { EntityRepository, Repository } from 'typeorm';
import { Course } from '../entities/course.entity';

@EntityRepository(Course)
export class CourseRepository extends Repository<Course> {
  async getOneCourse(courseId: number) {
    return this.createQueryBuilder('course')
      .leftJoin('course.lessons', 'lesson', 'lesson.deletedAt IS NULL')
      .leftJoin('course.userCourses', 'userCourse')
      .leftJoin(
        'course.lessons',
        'firstLesson',
        'firstLesson.deletedAt IS NULL',
      )
      .addSelect('COUNT(DISTINCT userCourse.user)', 'userCount')
      .addSelect('MIN(lesson.id)', 'firstLessonId')
      .addSelect('firstLesson.id', 'firstLesson_id')
      .addSelect('firstLesson.name', 'firstLesson_name')
      .addSelect('firstLesson.course', 'firstLesson_course_id')
      .addSelect('firstLesson.id', 'firstLessonId')
      .addSelect('firstLesson.name', 'firstLessonName')
      .where('course.id = :id', { id: courseId })
      .andWhere('course.deletedAt IS NULL')
      .groupBy('course.id, firstLesson.id')
      .orderBy('lesson.createdAt', 'ASC')
      .addOrderBy('lesson.id', 'ASC')
      .getOne();
  }
}
