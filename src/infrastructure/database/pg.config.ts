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
  if (!process.env.PG_PORT) {
    throw Error('PG_PORT not provided');
  }
  if (!process.env.PG_HOST) {
    throw Error('PG_HOST not provided');
  }
  if (!process.env.PG_NAME) {
    throw Error('PG_NAME not provided');
  }
  if (!process.env.PG_USERNAME) {
    throw Error('PG_USERNAME not provided');
  }
  if (!process.env.PG_PASSWORD) {
    throw Error('PG_PASSWORD not provided');
  }

  return {
    port: +process.env.PG_PORT,
    host: process.env.PG_HOST,
    db_name: process.env.PG_NAME,
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
  };
});
