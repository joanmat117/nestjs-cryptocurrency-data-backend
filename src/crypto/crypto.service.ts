import { Injectable } from '@nestjs/common';
import Binance from "binance-api-node"

@Injectable()
export class CryptoService {

  private readonly cryptoClient = Binance({})

  async getPrices({ symbol }: {
    symbol?: string
  }) {

    if (!symbol) return await this.cryptoClient.prices()

    //@ts-expect-error
    return await this.cryptoClient.prices({ symbol })

  }

  async getTime() {
    return await this.cryptoClient.time()
  }

}
