import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeedModule);
  const seeder = appContext.get(SeedService);

  try {
    await seeder.executeSeed();
  } catch (error) {
    console.error('Seed has failed:', error);
    process.exit(1);
  } finally {
    await appContext.close();
    process.exit(0);
  }
}
void bootstrap();
