import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { AppModule } from '../app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [AppModule, TypeOrmModule.forFeature([User])],
  providers: [SeedService],
})
export class SeedModule {}
