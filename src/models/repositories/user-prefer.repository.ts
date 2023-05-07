import { EntityRepository, Repository } from 'typeorm';
import { UserPrefer } from '../entities/user-prefer.entity';

@EntityRepository(UserPrefer)
export class UserPreferRepository extends Repository<UserPrefer> {}
