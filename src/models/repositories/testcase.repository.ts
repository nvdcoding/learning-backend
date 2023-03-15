import { EntityRepository, Repository } from 'typeorm';
import { TestCase } from '../entities/testcase.entity';

@EntityRepository(TestCase)
export class TestcaseRepository extends Repository<TestCase> {}
