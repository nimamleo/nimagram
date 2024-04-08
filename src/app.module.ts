import { Module } from '@nestjs/common';
import { IoModule } from './io/io.module';
import { ConfigModule } from '@nestjs/config';
import { jwtConfig } from './infrastructure/auth/jwt/config/jwt.config';
import { appHttpConfig } from './io/http/app-http.config';
import { postgresConfig } from './infrastructure/database/pg.config';

@Module({
  imports: [
    IoModule,
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      load: [jwtConfig, appHttpConfig, postgresConfig],
      cache: true,
    }),
  ],
})
export class AppModule {}
