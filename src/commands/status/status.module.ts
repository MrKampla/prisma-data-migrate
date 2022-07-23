import { Module } from '@nestjs/common';
import { FileSystemService } from '../../services/fileSystem';
import { ScriptExecutorService } from '../../services/scriptExecutor';
import { StatusCommand } from '.';
import { StatusService } from './status.service';

@Module({
  providers: [
    StatusCommand,
    StatusService,
    FileSystemService,
    ScriptExecutorService,
  ],
})
export class StatusModule {}
