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
