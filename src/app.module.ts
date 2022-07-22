import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { Command } from 'commander';
import { InjectCommander } from 'nest-commander';
import { CreateModule } from './commands/create/create.module';
import { InitModule } from './commands/init/init.module';

@Module({
  imports: [InitModule, CreateModule],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(@InjectCommander() private readonly commander: Command) {}

  onApplicationBootstrap() {
    // set the name and description of the cli program
    this.commander.name('prisma-data-migrate');
    this.commander.description(
      'Create and manage your data migrations with Prisma in TypeScript',
    );
  }
}
