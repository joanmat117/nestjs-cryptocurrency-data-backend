import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CryptoService } from './crypto.service';
import { QuotesLatestDto } from './dto/quotes-latest.dto';
import { CryptocurrencyInfoDto } from './dto/cryptocurrency-info.dto';
import { GlobalMetricsQuotesLatestDto } from './dto/global-metrics-quotes-latest.dto';

@ApiTags('Cryptocurrency')
@Controller('crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get('latest-quotes')
  @ApiOperation({ summary: 'Get latest quotes (legacy endpoint)' })
  async latestQuotes() {
    return await this.cryptoService.quotes();
  }

  /**
   * Get latest cryptocurrency quotes
   * GET /v2/cryptocurrency/quotes/latest
   */
  @Get('v2/cryptocurrency/quotes/latest')
  @ApiOperation({
    summary: 'Get latest cryptocurrency quotes',
    description: 'Fetches the latest quotes for one or more cryptocurrencies',
  })
  @ApiQuery({
    name: 'symbol',
    required: false,
    description: 'Cryptocurrency symbol(s), comma-separated (e.g., BTC,ETH)',
    example: 'BTC',
  })
  @ApiQuery({
    name: 'id',
    required: false,
    description: 'Cryptocurrency ID(s), comma-separated',
  })
  @ApiQuery({
    name: 'slug',
    required: false,
    description: 'Cryptocurrency slug(s), comma-separated',
  })
  @ApiQuery({
    name: 'convert',
    required: false,
    description: 'Currency to convert prices to',
    example: 'USD',
  })
  async getLatestQuotes(@Query() dto: QuotesLatestDto) {
    return await this.cryptoService.getLatestQuotes(dto);
  }

  /**
   * Get cryptocurrency information
   * GET /v2/cryptocurrency/info
   */
  @Get('v2/cryptocurrency/info')
  @ApiOperation({
    summary: 'Get cryptocurrency information',
    description:
      'Fetches detailed metadata information about one or more cryptocurrencies',
  })
  @ApiQuery({
    name: 'id',
    required: false,
    description: 'Cryptocurrency ID(s), comma-separated',
  })
  @ApiQuery({
    name: 'symbol',
    required: false,
    description: 'Cryptocurrency symbol(s), comma-separated (e.g., BTC,ETH)',
    example: 'BTC',
  })
  @ApiQuery({
    name: 'slug',
    required: false,
    description: 'Cryptocurrency slug(s), comma-separated',
  })
  async getCryptocurrencyInfo(@Query() dto: CryptocurrencyInfoDto) {
    return await this.cryptoService.getCryptocurrencyInfo(dto);
  }

  /**
   * Get global metrics latest quotes
   * GET /v1/global-metrics/quotes/latest
   */
  @Get('v1/global-metrics/quotes/latest')
  @ApiOperation({
    summary: 'Get global cryptocurrency market metrics',
    description:
      'Fetches the latest global market data and quotes across all cryptocurrencies',
  })
  @ApiQuery({
    name: 'convert',
    required: false,
    description: 'Currency to convert market cap and volume to',
    example: 'USD',
  })
  async getGlobalMetricsQuotesLatest(
    @Query() dto: GlobalMetricsQuotesLatestDto,
  ) {
    return await this.cryptoService.getGlobalMetricsQuotesLatest(dto);
  }
}
