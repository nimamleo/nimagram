import { registerAsWithLog } from '../../../../common/config-helper';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';
import * as process from 'process';

export interface IJwtConfig {
  secret: string;
}

export const JWT_CONFIG_TOKEN = 'jwt-config-token';

export const jwtConfig = registerAsWithLog<
  IJwtConfig,
  ConfigFactory<IJwtConfig>
>(JWT_CONFIG_TOKEN, () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('jwt secret does not provided');
  }

  return {
    secret: process.env.JWT_SECRET,
  };
});
