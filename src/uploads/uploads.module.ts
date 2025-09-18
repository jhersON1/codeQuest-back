import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { UploadsController } from './uploads.controller';
import { AuthModule } from '../auth/auth.module';

const uploadsDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: uploadsDir,
        filename: (_req, file, cb) => {
          const ts = Date.now();
          const safe = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
          cb(null, `${ts}-${safe}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
    AuthModule,
  ],
  controllers: [UploadsController],
})
export class UploadsModule {}
