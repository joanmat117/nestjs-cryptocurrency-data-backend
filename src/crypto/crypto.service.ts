import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { restClient as coinMarketCap, type RestClient } from 'coinmarketcap-js';
import { QuotesLatestDto } from './dto/quotes-latest.dto';
import { CryptocurrencyInfoDto } from './dto/cryptocurrency-info.dto';
import { GlobalMetricsQuotesLatestDto } from './dto/global-metrics-quotes-latest.dto';

@Injectable()
export class CryptoService {
  private readonly CMC_PRO_API_KEY: string;
  private readonly coinMarketCapClient: RestClient;

  constructor(private readonly configService: ConfigService) {
    this.CMC_PRO_API_KEY = this.configService.getOrThrow('CMC_PRO_API_KEY');
    this.coinMarketCapClient = coinMarketCap(this.CMC_PRO_API_KEY);
  }

  async quotes() {
    return this.coinMarketCapClient.crypto.latestQuotes({ symbol: 'BTC' });
  }

  /**
   * Get latest cryptocurrency quotes
   * Endpoint: /v2/cryptocurrency/quotes/latest
   */
  async getLatestQuotes(dto: QuotesLatestDto) {
    const params: any = {};

    if (dto.symbol) params.symbol = dto.symbol;
    if (dto.id) params.id = dto.id;
    if (dto.slug) params.slug = dto.slug;
    if (dto.convert) params.convert = dto.convert;

    return this.coinMarketCapClient.crypto.latestQuotes(params);
  }

  /**
   * Get cryptocurrency information
   * Endpoint: /v2/cryptocurrency/info
   */
  async getCryptocurrencyInfo(dto: CryptocurrencyInfoDto) {
    const params: any = {};

    if (dto.id) params.id = dto.id;
    if (dto.symbol) params.symbol = dto.symbol;
    if (dto.slug) params.slug = dto.slug;

    return this.coinMarketCapClient.crypto.info(params);
  }

  /**
   * Get global metrics latest quotes
   * Endpoint: /v1/global-metrics/quotes/latest
   */
  async getGlobalMetricsQuotesLatest(dto: GlobalMetricsQuotesLatestDto) {
    const params: any = {};

    if (dto.convert) params.convert = dto.convert;

    return this.coinMarketCapClient.global.latestQuotes(params);
  }
}
