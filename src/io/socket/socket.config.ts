import { registerAsWithLog } from '../../common/config-helper';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';
import * as process from 'process';

export interface ISocketConfig {
  port: number;
}

export const SOCKET_CONFIG = 'SOCKET_CONFIG';

export const socketConfig = registerAsWithLog<
  ISocketConfig,
  ConfigFactory<ISocketConfig>
>(SOCKET_CONFIG, () => {
  if (!process.env.SOCKET_PORT) {
    throw Error('SOCKET_PORT is not provided');
  }

  return {
    port: +process.env.SOCKET_PORT,
  };
});
