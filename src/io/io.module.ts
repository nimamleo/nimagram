import { Module } from '@nestjs/common';
import { SocketGateway } from './socket/socket.gateway';
import { AuthHttpController } from './http/auth-http.controller';
import { ApplicationModule } from '../application/application.module';
import { AuthModule } from '../infrastructure/auth/auth.module';
import { WsGuard } from './socket/guard/ws.guard';

@Module({
  imports: [ApplicationModule, AuthModule],
  providers: [SocketGateway, WsGuard],
  controllers: [AuthHttpController],
})
export class IoModule {}
