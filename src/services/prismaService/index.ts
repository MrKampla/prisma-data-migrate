import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

declare const __DEV__: boolean;

@Injectable()
export class PrismaService {
  private prismaClient: PrismaClient;

  async executeQuery(query: string) {
    if (!this.prismaClient) {
      this.initializePrismaClient();
    }
    return this.prismaClient.$queryRawUnsafe(query);
  }

  private initializePrismaClient() {
    this.prismaClient = new PrismaClient({
      log: __DEV__ ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }
}
