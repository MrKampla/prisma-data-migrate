import { Module } from '@nestjs/common';
import { InitModule } from './commands/init/init.module';

@Module({
  imports: [InitModule],
})
export class AppModule {}
