import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import MeiliSearch from 'meilisearch';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'MEILISEARCH_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('MEILISEARCH_HOST') as string;
        const apiKey = configService.get<string>('MEILISEARCH_API_KEY');
        return new MeiliSearch({ host, apiKey });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['MEILISEARCH_CLIENT'],
})
export class MeilisearchModule {}
