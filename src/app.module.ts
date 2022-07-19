import { Module } from '@nestjs/common';
import { CreateModule } from './commands/create/create.module';
import { InitModule } from './commands/init/init.module';

@Module({
  imports: [InitModule, CreateModule],
})
export class AppModule {}
