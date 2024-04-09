import { Module } from '@nestjs/common';
import { SocketGateway } from './socket/socket.gateway';
import { AuthHttpController } from './http/auth-http.controller';
import { ApplicationModule } from '../application/application.module';
import { AuthModule } from '../infrastructure/auth/auth.module';
import { WsGuard } from './socket/guard/ws.guard';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [ApplicationModule, AuthModule],
  providers: [SocketGateway, WsGuard, ConfigService],
  controllers: [AuthHttpController],
})
export class IoModule {}
