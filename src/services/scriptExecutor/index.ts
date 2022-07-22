import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';

type Spawn = typeof spawn;

@Injectable()
export class ScriptExecutorService {
  async executeScript(
    command: Parameters<Spawn>[0],
    args: Parameters<Spawn>[1],
    options: Parameters<Spawn>[2] = {
      stdio: 'inherit',
    },
  ) {
    return new Promise<void>((resolve, reject) => {
      const scriptProcess = spawn(command, args, options);
      scriptProcess.on('close', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(code);
        }
      });
    });
  }
}
