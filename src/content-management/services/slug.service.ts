import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class SlugService {
  slugify(input: string): string {
    const from = input
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    return from.replace(/^-+|-+$/g, '');
  }

  async generateUniqueSlug<T extends { slug: string }>(
    base: string,
    repo: Repository<T>,
    excludeIdField?: keyof T & string,
    excludeIdValue?: number,
  ): Promise<string> {
    const baseSlug = this.slugify(base);
    let slug = baseSlug;
    let i = 1;
    while (true) {
      const qb = repo.createQueryBuilder('e').where('e.slug = :slug', { slug });
      if (excludeIdField && excludeIdValue)
        qb.andWhere(`e.${excludeIdField} != :id`, { id: excludeIdValue });
      const exists = await qb.getExists();
      if (!exists) return slug;
      i += 1;
      slug = `${baseSlug}-${i}`;
    }
  }
}
