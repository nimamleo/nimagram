import { registerAsWithLog } from '../../common/config-helper';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';
import * as process from 'process';

export class IAppHttpConfig {
  port: number;
}

export const APP_HTTP_CONFIG = 'app-http-config';

export const appHttpConfig = registerAsWithLog<
  IAppHttpConfig,
  ConfigFactory<IAppHttpConfig>
>(APP_HTTP_CONFIG, () => {
  if (!process.env.HTTP_PORT) {
    throw new Error('http port not provided');
  }

  return {
    port: Number(process.env.HTTP_PORT),
  };
});
