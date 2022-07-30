import { Command, CommandRunner, Option } from 'nest-commander';
import { FileSystemService } from '../../services/fileSystem';
import chalk from 'chalk';
import isValidFilename from 'valid-filename';
import { InvalidFileNameError, PrismaSchemaNotFoundError } from '../../errors';
import { BaselineService } from './baseline.service';
import { MigrationInfo } from '../../commands/deploy/types';

interface BaselineCommandOptions {
  schema?: string;
  migration: string;
}

@Command({
  name: 'baseline',
  description:
    'Assume that the migration has alredy been applied to the database',
})
export class BaselineCommand implements CommandRunner {
  constructor(
    private readonly fs: FileSystemService,
    private readonly baselineService: BaselineService,
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
    flags: '--migration [string]',
    description:
      'File name of the migration file that you want to mark as executed',
    required: true,
  })
  validateMigrationName(migrationName: string): string {
    const migrationNameWithoutSpaces = migrationName.replace(' ', '_');
    if (!isValidFilename(migrationNameWithoutSpaces)) {
      throw new InvalidFileNameError(migrationName);
    }
    return migrationNameWithoutSpaces;
  }

  async run(
    _passedParam: string[],
    options?: BaselineCommandOptions,
  ): Promise<void> {
    const migrations = await this.baselineService.getAllMigrationsToBaseline(
      options.migration,
      options.schema,
    );

    await this.baselineService.markMigrationsAsExecuted(migrations);

    this.printSuccessMessage(migrations);
  }

  private printSuccessMessage(migrations: MigrationInfo[]) {
    if (migrations.length === 0) {
      return console.log(
        `${chalk.blueBright('-')} Database is already up to date`,
      );
    }
    console.log(
      `${chalk.green('✔')} Successfully marked ${
        migrations.length
      } migration(s) as executed: 
      ${migrations.map(m => chalk.green(`- ${m.name}`)).join('\n      ')}`,
    );
  }
}
