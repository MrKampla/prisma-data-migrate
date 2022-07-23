import { Command, CommandRunner, Option } from 'nest-commander';
import { FileSystemService } from '../../services/fileSystem';
import chalk from 'chalk';
import isValidFilename from 'valid-filename';
import { CreateService } from './create.service';
import { InvalidFileNameError, PrismaSchemaNotFoundError } from '../../errors';

interface CreateCommandOptions {
  schema?: string;
  name?: string;
}

@Command({
  name: 'create',
  description: 'Create a new data migration file',
})
export class CreateCommand implements CommandRunner {
  constructor(
    private readonly fs: FileSystemService,
    private readonly createService: CreateService,
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
    flags: '--name [string]',
    description: 'Name of the new migration file',
    required: true,
  })
  validateMigrationName(migrationName: string): string {
    const migrationNameWithoutSpaces = migrationName.replace(' ', '_');
    if (!isValidFilename(migrationNameWithoutSpaces)) {
      throw new InvalidFileNameError(migrationName);
    }
    return migrationNameWithoutSpaces;
  }

  private printSuccessMessage(migrationName: string) {
    console.log(
      `${chalk.green(
        '✔',
      )} Successfully created a data migration file ${migrationName}. 
  You can now edit that migration and then deploy it to your database with ${chalk.blueBright(
    `npx prisma-data-migrate deploy`,
  )}`,
    );
  }

  async run(
    _passedParam: string[],
    options?: CreateCommandOptions,
  ): Promise<void> {
    const migrationName = this.createService.addCurrentTimestampToMigrationName(
      options.name,
    );
    await this.createService.createDataMigrationFile(
      migrationName,
      options.schema,
    );

    this.printSuccessMessage(migrationName);
  }
}
