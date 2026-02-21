import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 8000;

  await app.listen(port, '0.0.0.0');

  const url = await app.getUrl();
  return url;
}

bootstrap()
  .then((url) => {
    logger.log(`🚀 Application is running on: ${url}`);
  })
  .catch((err) => {
    logger.error('❌ Error starting application', err);
    process.exit(1);
  });
