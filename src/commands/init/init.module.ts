import { Module } from '@nestjs/common';
import { FileSystemService } from '../../services/fileSystem';
import { ScriptExecutorService } from '../../services/scriptExecutor';
import { InitCommand } from '.';
import { InitService } from './initService.service';

@Module({
  providers: [
    InitCommand,
    InitService,
    FileSystemService,
    ScriptExecutorService,
  ],
})
export class InitModule {}
