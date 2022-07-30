import { Command, CommandRunner, Option } from 'nest-commander';
import { FileSystemService } from '../../services/fileSystem';
import chalk from 'chalk';
import { PrismaSchemaNotFoundError } from '../../errors';
import { StatusService } from './status.service';

interface StatusCommandOptions {
  schema?: string;
  name?: string;
}

@Command({
  name: 'status',
  description: 'Check if database is up to date with data migrations',
})
export class StatusCommand implements CommandRunner {
  constructor(
    private readonly fs: FileSystemService,
    private readonly statusService: StatusService,
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

  async run(
    _passedParam: string[],
    options?: StatusCommandOptions,
  ): Promise<void> {
    // get created migrations from the file system
    // get executed migrations from the database
    const [migrations, executedMigratons] = await Promise.all([
      this.statusService.getMigrationsFromFileSystem(options.schema),
      this.statusService.getExecutedMigrationsFromDatabase(),
    ]);

    const isUpToDate = this.statusService.checkIfDatabaseIsUpToDate(
      migrations,
      executedMigratons,
    );

    if (isUpToDate) {
      return this.printSuccessMessage();
    }

    this.printFailureMessage(migrations, executedMigratons);
  }

  private printSuccessMessage() {
    console.log(
      `${chalk.green(
        '✔',
      )} Your database is up to date with the data migrations`,
    );
  }

  private printFailureMessage(
    migrations: { name: string }[],
    executedMigratons: { name: string }[],
  ) {
    console.log(
      `${chalk.red('✕')} Database is not up to date with data migrations:
  You have ${migrations.length} data migration file/files but ${
        executedMigratons.length
      } migrations that are executed on the database.
      `,
    );
    const isDatabaseBehind = migrations.length > executedMigratons.length;
    isDatabaseBehind
      ? console.log(
          `  You should run the following command: 
  ${chalk.blueBright('npx prisma-data-migrate deploy')} 
  in order to apply new migrations to the databse or: 
  ${`${chalk.blueBright(
    'npx prisma-data-migrate baseline --migration 20220723123439_example_migration_name.ts',
  )}`}
  in order to mark the migration as executed.`,
        )
      : console.log(
          `There is a mismatch between your filesystem and the database state. Try to manually investigate the data migrations table to see what's missing.`,
        );
  }
}
