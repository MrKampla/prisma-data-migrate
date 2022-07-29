import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

declare const __DEV__: boolean;

@Injectable()
export class PrismaService {
  private _prismaClient: PrismaClient;

  async executeQuery(query: string) {
    return this.prismaClient.$queryRawUnsafe(query);
  }

  private initializePrismaClient() {
    this._prismaClient = new PrismaClient({
      log: __DEV__ ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  get prismaClient() {
    if (!this._prismaClient) {
      this.initializePrismaClient();
    }
    return this._prismaClient;
  }
}
