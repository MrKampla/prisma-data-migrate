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
