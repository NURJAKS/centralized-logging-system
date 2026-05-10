import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JSoftMonitorFilter } from './jsoft-monitor.filter';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import { JSoftTransport } from './jsoft.transport';
import { Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

async function bootstrap() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [nodeProfilingIntegration()],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    });
  }

  const winstonLogger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          nestWinstonModuleUtilities.format.nestLike('E-Commerce-Client', {
            colors: true,
            prettyPrint: true,
          }),
        ),
      }),
      new JSoftTransport(),
    ],
  });

  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });

  const logger = new Logger('ExceptionFilter');
  app.useGlobalFilters(new JSoftMonitorFilter('E-Commerce-Client', logger));

  await app.listen(process.env.PORT ?? 3001);
  console.log('Тестовый клиент запущен на: http://localhost:3001');
}
bootstrap();
