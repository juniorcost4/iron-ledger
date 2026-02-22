import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const config = new DocumentBuilder()
    .setTitle('Iron Ledger API')
    .setDescription(
      'API do Iron Ledger - sistema de ledger para transações financeiras (depósitos, transferências e extratos).',
    )
    .setVersion('1.0')
    .addTag('users', 'Cadastro e consulta de usuários')
    .addTag('accounts', 'Abertura e gestão de contas')
    .addTag('transactions', 'Depósitos, transferências e extratos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

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
