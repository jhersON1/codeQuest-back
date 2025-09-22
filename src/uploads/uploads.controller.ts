import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { extname, join } from 'path';
import type { Express } from 'express';
import { Auth } from '../auth/decorators/auth.decorator';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  @Post()
  @Auth()
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(png|jpe?g|gif|webp|svg)$/i.test(file.originalname);
        const isImage = /^image\//i.test(file.mimetype);

        if (allowed && isImage) return cb(null, true);

        cb(new BadRequestException('Solo se permiten imágenes'), false);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo no recibido');

    const base = process.env.PUBLIC_URL || process.env.APP_URL || 'http://localhost:3000';
    const url = `${base}/uploads/${file.filename}`;
    return {
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      ext: extname(file.originalname).toLowerCase(),
      url,
      path: join('/uploads', file.filename).replace(/\\/g, '/'),
    };
  }
}
