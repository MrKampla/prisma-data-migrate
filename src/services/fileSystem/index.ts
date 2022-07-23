import { Injectable } from '@nestjs/common';
import fs from 'fs/promises';

type FsReadFile = typeof fs.readFile;
type FsWriteFile = typeof fs.writeFile;

@Injectable()
export class FileSystemService {
  async readFile(
    ...params: Parameters<FsReadFile>
  ): Promise<ReturnType<FsReadFile>> {
    return fs.readFile(...params);
  }
  async writeFile(...params: Parameters<FsWriteFile>): Promise<void> {
    return fs.writeFile(...params);
  }
  async checkIfFileExists(path: string): Promise<boolean> {
    return fs
      .stat(path)
      .then(stats => stats.isFile())
      .catch(() => false);
  }
  async createDirectory(path: string) {
    return fs.mkdir(path, { recursive: true });
  }
  async listFilesInDirectory(path: string): Promise<string[]> {
    const entries = await fs.readdir(path, { withFileTypes: true });
    return entries.filter(entry => entry.isFile()).map(file => file.name);
  }
}
