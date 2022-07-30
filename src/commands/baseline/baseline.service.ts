import { Injectable } from '@nestjs/common';
import { FileSystemService } from '../../services/fileSystem';
import { join, dirname, parse } from 'path';
import { MigrationFileDoesNotExistError } from '../../errors';
import { DeployService } from '../../commands/deploy/deploy.service';
import { MigrationInfo } from '../../commands/deploy/types';

@Injectable()
export class BaselineService {
  constructor(
    private readonly fs: FileSystemService,
    private readonly deployService: DeployService,
  ) {}

  async getAllMigrationsToBaseline(
    migrationToBaseline: string,
    prismaSchemaPath: string,
  ) {
    const doesMigrationFileExist = await this.checkIfMigrationExistsOnFileSystem(
      migrationToBaseline,
      prismaSchemaPath,
    );

    if (!doesMigrationFileExist) {
      throw new MigrationFileDoesNotExistError(migrationToBaseline);
    }

    const migrationsNotYetApplied = await this.deployService.getListOfMigrationsToExecute(
      prismaSchemaPath,
    );

    const baselineIndex = migrationsNotYetApplied.findIndex(
      migration => migration.name === parse(migrationToBaseline).name,
    );

    return migrationsNotYetApplied.slice(0, baselineIndex + 1); // +1 to include the selected migration to baseline
  }

  private async checkIfMigrationExistsOnFileSystem(
    migrationFileName: string,
    pathToPrismaSchemaFile: string,
  ) {
    const pathToDataMigrationsDirectory = join(
      dirname(pathToPrismaSchemaFile),
      'dataMigrations',
    );
    const pathToMigrationFile = join(
      pathToDataMigrationsDirectory,
      migrationFileName,
    );

    return this.fs.checkIfFileExists(pathToMigrationFile);
  }

  async markMigrationsAsExecuted(migrations: MigrationInfo[]) {
    return this.deployService.markMigrationsAsExecuted(
      migrations.map(migration => ({
        fileName: migration.fileName,
        isSuccess: true,
        startedAt: new Date(),
        finishedAt: new Date(),
      })),
    );
  }
}
