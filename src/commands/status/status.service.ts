import { Injectable } from '@nestjs/common';
import { join, dirname, parse } from 'path';
import { PrismaService } from '../../services/prismaService';
import { prisma_data_migrations as PrismaDataMigration } from '@prisma/client';
import { FileSystemService } from '../../services/fileSystem';

@Injectable()
export class StatusService {
  constructor(
    private readonly fsService: FileSystemService,
    private readonly prismaService: PrismaService,
  ) {}

  async getMigrationsFromFileSystem(
    prismaSchemaFilePath: string,
  ): Promise<Pick<PrismaDataMigration, 'name'>[]> {
    const migrationFiles = (
      await this.fsService.listFilesInDirectory(
        join(dirname(prismaSchemaFilePath), 'dataMigrations'),
      )
    ).filter(file => ['.ts', '.js'].includes(parse(file).ext));
    return this.getMigrationNames(migrationFiles);
  }

  private getMigrationNames(migrationFiles: string[]) {
    return migrationFiles
      .map(file => parse(file))
      .filter(file => ['.ts', '.js'].includes(file.ext))
      .map(file => ({ name: file.name }));
  }

  async getExecutedMigrationsFromDatabase() {
    const migrations = (await this.prismaService.executeQuery(
      `SELECT * FROM prisma_data_migrations;`,
    )) as PrismaDataMigration[];
    return migrations;
  }

  checkIfDatabaseIsUpToDate(
    migrations: Pick<PrismaDataMigration, 'name'>[],
    executedMigratons: PrismaDataMigration[],
  ) {
    if (migrations.length !== executedMigratons.length) {
      return false;
    }
    return migrations.every(migration =>
      executedMigratons.some(
        executedMigration => executedMigration.name === migration.name,
      ),
    );
  }
}
