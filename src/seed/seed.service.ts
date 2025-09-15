import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { seedUsers } from './data/seed-users';
import * as argon2 from 'argon2'
@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async executeSeed() {
    this.logger.log('Intializing seed process...');
    await this.seedUsers();

    this.logger.log('Seed process completed succesfully');
    return;
  }

  async seedUsers() {
    await this.deleteTableRegisters(this.userRepository);

    const hashedUsers = await Promise.all(seedUsers.map(async user => {

      user.password = await argon2.hash(user.password)

      return user
    }))

    const stagedSeedUsers: User[] = this.userRepository.create(hashedUsers);

    await this.userRepository.save(stagedSeedUsers);
    this.logger.log(`Created ${stagedSeedUsers.length} Users`);
    return;
  }

  async deleteTableRegisters<T extends ObjectLiteral>(repository: Repository<T>) {
    const queryBuilder = repository.createQueryBuilder();

    await queryBuilder.delete().where({}).execute();

    return;
  }
}
