import { EntityRepository, Repository } from 'typeorm';
import { Exercise } from '../entities/excercise.entity';

@EntityRepository(Exercise)
export class ExcerciseRepository extends Repository<Exercise> {}
