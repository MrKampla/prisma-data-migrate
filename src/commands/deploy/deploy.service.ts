/* eslint-disable @typescript-eslint/camelcase */
import { Injectable } from '@nestjs/common';
import { join, dirname } from 'path';
import { PrismaService } from '../../services/prismaService';
import { Migration, MigrationInfo, MigrationResult } from './types';
import chalk from 'chalk';
import path from 'path';
import { performance } from 'perf_hooks';
import { StatusService } from '../../commands/status/status.service';
import { IncorrectMigrationHistoryError } from '../../errors';
import { prisma_data_migrations } from '.prisma/client';

@Injectable()
export class DeployService {
  constructor(
    private readonly statusService: StatusService,
    private readonly prismaService: PrismaService,
  ) {}

  async getListOfMigrationsToExecute(
    prismaSchemaPath: string,
  ): Promise<MigrationInfo[]> {
    const [migrations, executedMigratons] = await Promise.all([
      this.statusService.getMigrationsFromFileSystem(prismaSchemaPath),
      this.statusService.getExecutedMigrationsFromDatabase(),
    ]);

    const isUpToDate = this.statusService.checkIfDatabaseIsUpToDate(
      migrations,
      executedMigratons,
    );

    if (isUpToDate) {
      return [];
    }

    if (executedMigratons.length > migrations.length) {
      throw new IncorrectMigrationHistoryError();
    }

    const byMigrationsThatHaveNotBeenExecutedYet = (
      executedMigratonList: Pick<prisma_data_migrations, 'name'>[],
    ) => (migration: Pick<prisma_data_migrations, 'name'>) =>
      !executedMigratonList.find(
        executedMigration => executedMigration.name === migration.name,
      );

    return migrations
      .filter(byMigrationsThatHaveNotBeenExecutedYet(executedMigratons))
      .map(migrationFile => ({
        name: path.parse(migrationFile.name).name,
        fileName: migrationFile.name,
      }));
  }

  async executeMigrations(
    prismaSchemaPath: string,
    migrations: MigrationInfo[],
  ) {
    return migrations.reduce<Promise<MigrationResult[]>>(
      async (migrationResults, migration) => {
        const results = await migrationResults;

        if (results.some(result => result.isSuccess === false)) {
          // if any of the previous migrations failed, we don't need to execute the rest
          // hence no operation is performed
          return results;
        }

        const result = await this.executeMigration(
          prismaSchemaPath,
          migration.fileName,
        );
        return [...results, result];
      },
      Promise.resolve([]),
    );
  }

  private async executeMigration(
    prismaSchemaPath: string,
    migrationFileName: string,
  ): Promise<MigrationResult> {
    const migration = await this.getDesiredMigration(
      prismaSchemaPath,
      migrationFileName,
    );

    console.log(
      chalk.yellow(`***** Executing migration ${migrationFileName}... *****`),
    );
    const startTimestamp = performance.now();
    try {
      await migration(this.prismaService.prismaClient);
    } catch (error) {
      console.log(
        chalk.red(`***** Migration ${migrationFileName} failed to execute.
        Reason: ${error.message} *****`),
      );
      return {
        fileName: migrationFileName,
        isSuccess: false,
        error,
      };
    }
    const endTimestamp = performance.now();

    console.log(
      chalk.green(
        `***** Migration ${migrationFileName} was successfully executed *****`,
      ),
    );
    return {
      fileName: migrationFileName,
      isSuccess: true,
      startedAt: new Date(performance.timeOrigin + startTimestamp),
      finishedAt: new Date(performance.timeOrigin + endTimestamp),
    };
  }

  private async getDesiredMigration(
    prismaSchemaPath: string,
    migrationName: string,
  ) {
    try {
      const modulePath = join(
        process.cwd(),
        dirname(prismaSchemaPath),
        'dataMigrations',
        migrationName,
      );
      const requestedMigrationModule: {
        default: Migration;
        // eslint-disable-next-line @typescript-eslint/no-var-requires
      } = require(modulePath);
      return requestedMigrationModule.default;
    } catch (err) {
      console.log(JSON.stringify(err, null, 4));
      console.log(err);
      process.exit(-1);
    }
  }

  async markMigrationsAsExecuted(
    migrationFileNames: (MigrationResult & { isSuccess: true })[],
  ) {
    await this.prismaService.prismaClient.prisma_data_migrations.createMany({
      data: migrationFileNames.map(migration => ({
        name: path.parse(migration.fileName).name,
        started_at: migration.startedAt,
        finished_at: migration.finishedAt,
      })),
    });
  }
}
