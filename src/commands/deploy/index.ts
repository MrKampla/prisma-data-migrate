import { Command, CommandRunner, Option } from 'nest-commander';
import { FileSystemService } from '../../services/fileSystem';
import { PrismaSchemaNotFoundError } from '../../errors';
import { DeployService } from './deploy.service';
import { MigrationResult } from './types';
import chalk from 'chalk';

interface DeployCommandOptions {
  schema?: string;
  dryRun?: boolean;
}

@Command({
  name: 'deploy',
  description: 'Deploy data migrations to your database',
})
export class DeployCommand implements CommandRunner {
  constructor(
    private readonly fs: FileSystemService,
    private readonly deployService: DeployService,
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
    flags: '--dryRun [boolean]',
    description:
      "Don't mark this migration as executed in the database, usefull for tesing purposes",
    defaultValue: false,
  })
  validateDryRun(isDryRun: string): string {
    return JSON.parse(isDryRun);
  }

  async run(
    _passedParam: string[],
    options?: DeployCommandOptions,
  ): Promise<void> {
    const migrations = await this.deployService.getListOfMigrationsToExecute(
      options.schema,
    );

    const migrationResults = await this.deployService.executeMigrations(
      options.schema,
      migrations,
    );

    if (!options.dryRun) {
      await this.deployService.markMigrationsAsExecuted(
        migrationResults.filter(
          result => result.isSuccess,
        ) as (MigrationResult & { isSuccess: true })[],
      );
    }

    this.printResultMessage(migrationResults);
  }

  printResultMessage(migrationResults: MigrationResult[]) {
    if (migrationResults.length === 0) {
      return console.log(
        `${chalk.blueBright(
          '-',
        )} No migrations were executed. The database is up to date.`,
      );
    }

    const successfullMigrations = migrationResults.filter(
      result => result.isSuccess,
    ) as (MigrationResult & { isSuccess: true })[];

    const failedMigrations = migrationResults.filter(
      result => !result.isSuccess,
    ) as (MigrationResult & { isSuccess: false })[];

    if (successfullMigrations.length) {
      console.log(`${chalk.green(
        '✔',
      )} Successfully deployed following data migrations:
        ${successfullMigrations
          .map(result => chalk.green(`- ${result.fileName}`))
          .join('\n        ')}`);
    }

    if (failedMigrations.length) {
      console.log(`${chalk.red('✕')} Some migrations failed to execute:
      ${failedMigrations
        .map(result => chalk.red(`- ${result.fileName} => ${result.error}`))
        .join('\n        ')}
      `);
    }

    if (migrationResults.every(result => result.isSuccess)) {
      console.log(
        chalk.green('Your database is now up to date with the data migrations'),
      );
      return;
    }
  }
}
