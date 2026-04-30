import { Controller, Get, Param, Query, UseFilters } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { BinanceExceptionFilter } from './filters/binance-exception.filter';

@Controller('crypto')
@UseFilters(BinanceExceptionFilter)
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) { }


  @Get('prices{/:symbol}')
  getPrices(
    @Param('symbol') symbol?: string
  ) {
    return this.cryptoService.getPrices({
      symbol: symbol?.toUpperCase()
    })
  }

  @Get('time')
  getBinanceTime() {
    return this.cryptoService.getTime()
  }
}
