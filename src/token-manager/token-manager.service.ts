import { Inject, Injectable } from '@nestjs/common';
import { TokenManagerConfig } from '../config/interfaces/config.interfaces';
import axios from 'axios';
import { UpdateTokenRequest } from './requests/update-token.request';

@Injectable()
export class TokenManagerService {
  constructor(
    @Inject('TOKEN_MANAGER_CONFIG') private config: TokenManagerConfig,
  ) {}

  async updateToken({ txHash, address, deployer }: UpdateTokenRequest) {
    const url = `${this.config.url}/token/${txHash}`;
    try {
      const response = await axios.patch(url, {
        address,
        deployer,
      });
      return response.data;
    } catch (error) {
      // Handle error
      console.error(error);
      throw error;
    }
  }
}
