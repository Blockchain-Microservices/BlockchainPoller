import { Inject, Injectable } from '@nestjs/common';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  PollerConfig,
  TokenManagerConfig,
} from './interfaces/config.interfaces';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  WEB3_PROVIDER: string;

  @IsString()
  @IsNotEmpty()
  CONTRACT_ADDRESS: string;

  @IsNumber()
  @IsOptional()
  START_BLOCK?: number;

  @IsString()
  @IsNotEmpty()
  TOKEN_MANAGER_URL: string;
}

@Injectable()
export class ConfigService {
  constructor(@Inject('ENV') private env: EnvironmentVariables) {
    this.env = this.validateConfig();
  }

  getPollerConfig(): PollerConfig {
    return {
      provider: this.env.WEB3_PROVIDER,
      contractAddress: this.env.CONTRACT_ADDRESS,
      startBlock: this.env.START_BLOCK && +this.env.START_BLOCK,
    };
  }

  getTokenManagerConfig(): TokenManagerConfig {
    return {
      url: this.env.TOKEN_MANAGER_URL,
    };
  }

  private validateConfig() {
    const validatedConfig = plainToClass(EnvironmentVariables, this.env, {
      enableImplicitConversion: true,
    });
    const errors = validateSync(validatedConfig, {
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      throw new Error(errors.toString());
    }
    return validatedConfig;
  }
}
