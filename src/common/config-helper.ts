import { ConfigObject } from '@nestjs/config/dist/types';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';
import { ConfigFactoryKeyHost } from '@nestjs/config/dist/utils/register-as.util';
import { Logger } from '@nestjs/common';
import { registerAs } from '@nestjs/config';

const logger = new Logger('ConfigLoader');

export function registerAsWithLog<
  TConfig extends ConfigObject,
  TFactory extends ConfigFactory = ConfigFactory<TConfig>,
>(
  token: string,
  configFactory: TFactory,
): TFactory & ConfigFactoryKeyHost<ReturnType<TFactory>> {
  const configValue: any = registerAs(token, () => {
    const value = configFactory();
    logger.debug(`${token}: ${JSON.stringify(value)}`);
    return value;
  });

  return configValue;
}
