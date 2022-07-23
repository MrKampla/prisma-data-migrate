import { Module } from '@nestjs/common';
import { FileSystemService } from '../../services/fileSystem';
import { CreateCommand } from '.';
import { CreateService } from './create.service';

@Module({
  providers: [CreateCommand, CreateService, FileSystemService],
})
export class CreateModule {}
