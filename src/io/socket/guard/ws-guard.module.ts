import { Module } from '@nestjs/common';

@Module({
  providers: [WsGuardModule],
  exports: [WsGuardModule],
})
export class WsGuardModule {}
