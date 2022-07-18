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
    return spawn(command, args, options);
  }
}
