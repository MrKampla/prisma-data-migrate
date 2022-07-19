import { Injectable } from '@nestjs/common';
import { FileSystemService } from '../../services/fileSystem';
import { join, dirname } from 'path';
import migrationStarter from './migrationStarter';

@Injectable()
export class CreateService {
  constructor(private readonly fs: FileSystemService) {}

  addCurrentTimestampToMigrationName(migrationName: string) {
    return `${this.getCurrentTimeStamp()}_${migrationName}.ts`;
  }

  private getCurrentTimeStamp() {
    return new Date()
      .toISOString()
      .split('T')
      .reverse()
      .join('')
      .replace(/[:.-]/g, '')
      .replace('Z', '');
  }

  async createDataMigrationFile(
    migrationName: string,
    pathToPrismaSchemaFile: string,
  ) {
    const pathToDataMigrationsDirectory = join(
      dirname(pathToPrismaSchemaFile),
      'dataMigrations',
    );
    const pathToMigrationFile = join(
      pathToDataMigrationsDirectory,
      migrationName,
    );
    await this.fs.writeFile(pathToMigrationFile, migrationStarter);
  }
}
