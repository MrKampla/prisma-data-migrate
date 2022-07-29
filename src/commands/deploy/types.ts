import { PrismaClient } from '@prisma/client';

export type Migration = (prismaClient: PrismaClient) => Promise<unknown>;

export interface MigrationInfo {
  name: string;
  fileName: string;
}

export type MigrationResult =
  | {
      fileName: string;
      isSuccess: true;
      startedAt: Date;
      finishedAt: Date;
    }
  | {
      fileName: string;
      isSuccess: false;
      error: Error;
    };
