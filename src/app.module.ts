import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ContentManagementModule } from './content-management/content-management.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CommentsModule } from './comments/comments.module';
import { ReactionsViewsModule } from './reactions-views/reactions-views.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      port: +process.env.DB_PORT!,
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    ContentManagementModule,
    CommentsModule,
    ReactionsViewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
