import { Controller, Get, Param, Query } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CandlesParamsDto } from './dto/candles-params.dto';

@Controller('crypto')
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

  @Get('graph/:symbol')
  getGraph(
    @Param('symbol') symbol: string,
    @Query() { interval, endTime, limit, startTime }: CandlesParamsDto
  ) {
    return this.cryptoService.getCandles({
      symbol: symbol.toUpperCase(),
      interval,
      limit,
      endTime,
      startTime
    })
  }

  @Get('time')
  getBinanceTime() {
    return this.cryptoService.getTime()
  }
}
