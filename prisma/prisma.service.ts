import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { HandleError } from '../src/common/decorators/handler-error.decorator';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }

  @HandleError
  async onModuleInit() {
    await this.$connect();
  }
}
