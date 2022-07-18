import { Command, CommandRunner, Option } from 'nest-commander';
import {
  MigrationTableNameNotPassedError,
  PrismaSchemaNotFoundError,
} from '../../errors';
import { FileSystemService } from '../../services/fileSystem';
import { InitService } from './initService.service';
import chalk from 'chalk';

interface InitCommandOptions {
  schema?: string;
  table?: string;
}

@Command({
  name: 'init',
  description: 'Initialize prisma data migrate database table',
})
export class InitCommand implements CommandRunner {
  constructor(
    private readonly fs: FileSystemService,
    private readonly initService: InitService,
  ) {}

  @Option({
    flags: '--schema [string]',
    description: 'Custom path to your Prisma schema',
    defaultValue: './prisma/schema.prisma',
  })
  validateSchemaPath(path: string): string {
    if (!this.fs.checkIfFileExists(path)) {
      throw new PrismaSchemaNotFoundError(path);
    }
    return path;
  }

  @Option({
    flags: '--table [string]',
    description: 'Custom name of the table containing the status of migrations',
    defaultValue: 'prisma_data_migrations',
  })
  validateMigrationTableName(tableName: string): string {
    if (!tableName) {
      throw new MigrationTableNameNotPassedError();
    }
    return tableName;
  }

  private printSuccessMessage() {
    console.log(
      `${chalk.green(
        '✔',
      )} Successfully initialized data migrations table schema. 
  You can now create & run a migration that will create the data migrations table.
  After that, you can use the prisma-data-migrate features.`,
    );
  }

  async run(
    _passedParam: string[],
    options?: InitCommandOptions,
  ): Promise<void> {
    await this.initService.initializeDataMigrationsTableSchema(
      options.schema,
      options.table,
    );
    await this.initService.createDataMigrationsDirectory(options.schema);
    this.printSuccessMessage();
  }
}
