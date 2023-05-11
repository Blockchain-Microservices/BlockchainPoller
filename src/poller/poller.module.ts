import { Module, Provider } from '@nestjs/common';
import { PollerService } from './poller.service';
import factoryAbi from '../abi/factory.abi';
import { ConfigService } from '../config/config.service';
import { PollerConfig } from '../config/interfaces/config.interfaces';
import { ConfigModule } from '../config/config.module';
import { TokenManagerModule } from '../token-manager/token-manager.module';

const abi: Provider = {
  provide: 'ABI',
  useValue: factoryAbi,
};

const pollerConfig: Provider = {
  provide: 'POLLER_CONFIG',
  useFactory: (configService: ConfigService): PollerConfig =>
    configService.getPollerConfig(),
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule, TokenManagerModule],
  providers: [PollerService, abi, pollerConfig],
})
export class PollerModule {}
