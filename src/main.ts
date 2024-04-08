import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfig } from './infrastructure/auth/jwt/config/jwt.config';
import {
  APP_HTTP_CONFIG,
  appHttpConfig,
  IAppHttpConfig,
} from './io/http/app-http.config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { postgresConfig } from './infrastructure/database/pg.config';

async function loadConfig(): Promise<ConfigService> {
  const appContext = await NestFactory.createApplicationContext(
    ConfigModule.forRoot({
      load: [jwtConfig, appHttpConfig, postgresConfig],
    }),
  );

  return appContext.get<ConfigService>(ConfigService);
}
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const configService = await loadConfig();
  const appConfig = configService.get<IAppHttpConfig>(APP_HTTP_CONFIG);
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
      allowedHeaders: '*',
      methods: '*',
      exposedHeaders: ['Content-Disposition'],
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();
  await app.listen(appConfig.port);
  logger.log(`Application started in http://127.0.0.1:${appConfig.port}`);
}
bootstrap();
