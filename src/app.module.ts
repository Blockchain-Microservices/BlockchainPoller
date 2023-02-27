import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from './config/config.module';
import { PollerModule } from './poller/poller.module';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule, PollerModule],
})
export class AppModule {}
