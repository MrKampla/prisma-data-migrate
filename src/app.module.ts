import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { Command } from 'commander';
import { StatusModule } from './commands/status/status.module';
import { InjectCommander } from 'nest-commander';
import { CreateModule } from './commands/create/create.module';
import { InitModule } from './commands/init/init.module';
import { PrismaModule } from './services/prismaService/prisma.module';
import { DeployModule } from './commands/deploy/deploy.module';
import { BaselineModule } from './commands/baseline/baseline.module';

@Module({
  imports: [
    InitModule,
    CreateModule,
    StatusModule,
    DeployModule,
    BaselineModule,
    PrismaModule,
  ],
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
