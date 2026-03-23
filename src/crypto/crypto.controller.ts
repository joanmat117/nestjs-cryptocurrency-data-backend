import { Controller, Get, Query } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { QuotesLatestDto } from './dto/quotes-latest.dto';
import { CryptocurrencyInfoDto } from './dto/cryptocurrency-info.dto';
import { GlobalMetricsQuotesLatestDto } from './dto/global-metrics-quotes-latest.dto';

@Controller('crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get('latest-quotes')
  async latestQuotes() {
    return await this.cryptoService.quotes();
  }

  /**
   * Get latest cryptocurrency quotes
   * GET /v2/cryptocurrency/quotes/latest
   */
  @Get('v2/cryptocurrency/quotes/latest')
  async getLatestQuotes(@Query() dto: QuotesLatestDto) {
    return await this.cryptoService.getLatestQuotes(dto);
  }

  /**
   * Get cryptocurrency information
   * GET /v2/cryptocurrency/info
   */
  @Get('v2/cryptocurrency/info')
  async getCryptocurrencyInfo(@Query() dto: CryptocurrencyInfoDto) {
    return await this.cryptoService.getCryptocurrencyInfo(dto);
  }

  /**
   * Get global metrics latest quotes
   * GET /v1/global-metrics/quotes/latest
   */
  @Get('v1/global-metrics/quotes/latest')
  async getGlobalMetricsQuotesLatest(
    @Query() dto: GlobalMetricsQuotesLatestDto,
  ) {
    return await this.cryptoService.getGlobalMetricsQuotesLatest(dto);
  }
}
