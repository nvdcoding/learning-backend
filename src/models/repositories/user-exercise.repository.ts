import { EntityRepository, Repository } from 'typeorm';
import { UserExercise } from '../entities/user-excercise.entity';

@EntityRepository(UserExercise)
export class UserExerciseRepository extends Repository<UserExercise> {}
