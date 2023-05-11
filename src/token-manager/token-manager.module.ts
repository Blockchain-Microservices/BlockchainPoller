import { ConfigService } from '../config/config.service';
import { TokenManagerConfig } from '../config/interfaces/config.interfaces';
import { Module, Provider } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { TokenManagerService } from './token-manager.service';

const tokenManagerConfig: Provider = {
  provide: 'TOKEN_MANAGER_CONFIG',
  useFactory: (configService: ConfigService): TokenManagerConfig =>
    configService.getTokenManagerConfig(),
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule],
  providers: [TokenManagerService, tokenManagerConfig],
  exports: [TokenManagerService],
})
export class TokenManagerModule {}
