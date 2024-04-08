import { registerAsWithLog } from '../../common/config-helper';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';
import * as process from 'process';

export interface IPgConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  db_name: string;
}

export const POSTGRES_CONFIG = 'postgres-config';

export const postgresConfig = registerAsWithLog<
  IPgConfig,
  ConfigFactory<IPgConfig>
>(POSTGRES_CONFIG, () => {
  if (!process.env.POSTGRES_PORT) {
    throw Error('POSTGRES_PORT not provided');
  }
  if (!process.env.POSTGRES_HOST) {
    throw Error('POSTGRES_HOST not provided');
  }
  if (!process.env.POSTGRES_DB) {
    throw Error('POSTGRES_DB not provided');
  }

  if (!process.env.POSTGRES_USERNAME) {
    throw Error('POSTGRES_USERNAME not provided');
  }
  if (!process.env.POSTGRES_PASSWORD) {
    throw Error('PG_PASSWORD not provided');
  }

  return {
    port: +process.env.POSTGRES_PORT,
    host: process.env.POSTGRES_HOST,
    db_name: process.env.POSTGRES_NAME,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
  };
});
