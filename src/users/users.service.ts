import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { ListUsersDto, UsersSort } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';

type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; hasNextPage: boolean };
};

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  private buildMeta(page: number, limit: number, total: number) {
    return { page, limit, total, hasNextPage: page * limit < total };
  }

  private applySort(qb: SelectQueryBuilder<User>, sort?: UsersSort) {
    switch (sort) {
      case 'username_asc':
        qb.addOrderBy('user.username', 'ASC');
        break;
      case 'username_desc':
        qb.addOrderBy('user.username', 'DESC');
        break;
      case 'created_at_asc':
        qb.addOrderBy('user.created_at', 'ASC');
        break;
      case 'created_at_desc':
      default:
        qb.addOrderBy('user.created_at', 'DESC');
        break;
    }
  }

  async list(params: ListUsersDto): Promise<Paginated<User>> {
    const { page, limit, q, role, sort } = params;
    const qb = this.userRepo.createQueryBuilder('user');

    if (q) qb.andWhere('(user.username ILIKE :q OR user.email ILIKE :q)', { q: `%${q}%` });
    if (role) qb.andWhere('user.role = :role', { role });

    this.applySort(qb, sort ?? 'created_at_desc');
    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    return { data, meta: this.buildMeta(page, limit, total) };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { user_id: id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (dto.username !== undefined) user.username = dto.username;
    if (dto.email !== undefined) user.email = dto.email as any; // nullable allowed
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.avatar_media_id !== undefined) user.avatar_media_id = dto.avatar_media_id ?? null;

    if (dto.password !== undefined) {
      user.password = await argon2.hash(dto.password);
    }

    try {
      return await this.userRepo.save(user);
    } catch (e: any) {
      if (e?.code === '23505') throw new ConflictException('Duplicate key');
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    const res = await this.userRepo.delete({ user_id: id });
    if (!res.affected) throw new NotFoundException('Usuario no encontrado');
  }
}

