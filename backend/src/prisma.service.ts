
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Cast to any to handle cases where the generated PrismaClient type might be out of sync or missing method definitions.
    await (this as any).$connect();
  }
}
