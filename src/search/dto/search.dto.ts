import { IsOptional, IsNumber, IsString, IsEnum, IsIn } from 'class-validator';

export class SearchPostsDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  tagId?: number;

  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: 'draft' | 'published' | 'archived';

  @IsOptional()
  @IsIn(['created_at', 'updated_at', 'title'])
  sortBy?: 'created_at' | 'updated_at' | 'title';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
