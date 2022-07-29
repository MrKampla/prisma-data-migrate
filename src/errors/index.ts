export class PrismaSchemaNotFoundError extends Error {
  constructor(path: string) {
    super(`Couldn't find schema file at ${path}`);
  }
}

export class MigrationTableNameNotPassedError extends Error {
  constructor() {
    super(`Migration table name not passed`);
  }
}

export class MigrationTableAlreadyExistsError extends Error {
  constructor(tableName: string) {
    super(
      `Data migrations table called '${tableName}' already exists in prisma schema file`,
    );
  }
}

export class InvalidFileNameError extends Error {
  constructor(migrationName: string) {
    super(`The migration name "${migrationName}" is not a valid filename.`);
  }
}

export class IncorrectMigrationHistoryError extends Error {
  constructor() {
    super(
      `The migration history is incorrect - some migration files are missing in the dataMigrations directory.`,
    );
  }
}
