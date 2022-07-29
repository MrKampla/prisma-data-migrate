import { Module } from '@nestjs/common';
import { StatusService } from '../../commands/status/status.service';
import { DeployCommand } from '.';
import { FileSystemService } from '../../services/fileSystem';
import { DeployService } from './deploy.service';

@Module({
  providers: [
    DeployCommand,
    DeployService,
    StatusService,
    FileSystemService,
    StatusService,
  ],
})
export class DeployModule {}
