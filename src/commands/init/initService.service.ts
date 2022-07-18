import { Injectable } from '@nestjs/common';
import { FileSystemService } from '../../services/fileSystem';
import { ScriptExecutorService } from '../../services/scriptExecutor';
import { join, dirname } from 'path';

@Injectable()
export class InitService {
  constructor(
    private readonly fs: FileSystemService,
    private readonly scriptExecutorService: ScriptExecutorService,
  ) {}
  async initializeDataMigrationsTableSchema(
    pathToPrismaSchema: string,
    tableName: string,
  ): Promise<void> {
    const prismaSchemaFile = (
      await this.fs.readFile(pathToPrismaSchema)
    ).toString();
    const modifiedSchemaFile = this.appendMigrationTableSchema(
      prismaSchemaFile,
      tableName,
    );
    await this.fs.writeFile(pathToPrismaSchema, modifiedSchemaFile);
    await this.scriptExecutorService.executeScript('npx', [
      'prisma',
      'format',
      '--schema',
      pathToPrismaSchema,
    ]);
  }

  private appendMigrationTableSchema(
    schemaFileContent: string,
    tableName: string,
  ): string {
    return `${schemaFileContent}\n${this.getMigrationTableSchema(tableName)}`;
  }

  private getMigrationTableSchema(tableName: string): string {
    return `model ${tableName} {
    id          String   @id
    name        String
    started_at  DateTime
    finished_at DateTime
}
`;
  }

  async createDataMigrationsDirectory(
    pathToPrismaSchema: string,
  ): Promise<void> {
    // TODO: add support for custom migrations directory name
    const pathToDataMigrationsDirectory = join(
      dirname(pathToPrismaSchema),
      'dataMigrations',
    );
    await this.fs.createDirectory(pathToDataMigrationsDirectory);
  }
}
