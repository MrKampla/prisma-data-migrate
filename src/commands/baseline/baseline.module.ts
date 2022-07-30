import { Module } from '@nestjs/common';
import { BaselineCommand } from '.';
import { FileSystemService } from '../../services/fileSystem';
import { BaselineService } from './baseline.service';
import { DeployService } from '../../commands/deploy/deploy.service';
import { StatusService } from '../../commands/status/status.service';

@Module({
  providers: [
    BaselineCommand,
    BaselineService,
    StatusService,
    DeployService,
    FileSystemService,
  ],
})
export class BaselineModule {}
