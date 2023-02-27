import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BigNumber, ethers } from 'ethers';
import { LogDescription } from 'ethers/lib/utils';
import { PollerConfig } from '../config/interfaces/config.interfaces';

export const bigNumberConverter = (arg: BigNumber) => arg.toString();

export const converters = {
  uint256: bigNumberConverter,
  uint8: bigNumberConverter,
};

@Injectable()
export class PollerService implements OnModuleInit {
  private readonly contract: ethers.Contract;
  private readonly iface: ethers.utils.Interface;
  private readonly provider: ethers.providers.JsonRpcProvider;
  private startBlock: number;

  constructor(
    @Inject('ABI') private readonly abi: ethers.ContractInterface,
    @Inject('POLLER_CONFIG') private readonly config: PollerConfig,
  ) {
    this.provider = new ethers.providers.JsonRpcProvider(config.provider);
    this.contract = new ethers.Contract(
      this.config.contractAddress,
      this.abi,
      this.provider,
    );
    this.iface = new ethers.utils.Interface(JSON.stringify(abi));
  }

  async onModuleInit() {
    this.startBlock =
      this.config.startBlock || (await this.contract.provider.getBlockNumber());
  }

  parseEventArgs(parsedEvent: LogDescription) {
    const args = parsedEvent.eventFragment.inputs.reduce(
      (acc, { name, type }) => {
        const rawValue = parsedEvent.args[name];
        const value = converters[type]?.(rawValue) || rawValue;
        acc[name] = value;
        return acc;
      },
      {},
    );

    return args;
  }

  @Cron('*/20 * * * * *')
  async processPaymentTransferredEvents() {
    const filters = [
      ...new Set(
        Object.values(this.contract.filters).map(
          (method) => method().topics[0] as string,
        ),
      ),
    ];

    const currentBlockchainBlock =
      await this.contract.provider.getBlockNumber();

    try {
      if (this.startBlock > currentBlockchainBlock) {
        Logger.warn('No new blocks found. Skipping');
        return;
      }

      Logger.log(
        `Polling events from ${this.startBlock} to ${currentBlockchainBlock}`,
      );
      const events = await this.contract.queryFilter(
        { topics: [filters], address: this.config.contractAddress },
        this.startBlock,
        currentBlockchainBlock,
      );

      await this.processEvents(events);

      this.startBlock = currentBlockchainBlock + 1;
    } catch (err) {
      Logger.error(`Error processing events: ${err}`);
    }
  }

  private async processEvents(events: ethers.Event[]): Promise<void> {
    if (!events.length) return;

    Logger.log(`Processing ${events.length} events`);

    for (const event of events) {
      const parsedEvent = this.iface.parseLog(event);
      const args = this.parseEventArgs(parsedEvent);

      Logger.log(
        `${parsedEvent.name}: ${JSON.stringify(args)}; tx ${
          event.transactionHash
        }`,
      );
    }
  }
}
