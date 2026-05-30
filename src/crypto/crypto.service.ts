import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { ProblemDetailsException } from 'nest-problem-details-filter';
import { QuerySimplePriceDto } from './dto/query-simple-price.dto';
import { QuerySimpleTokenPriceDto } from './dto/query-simple-token-price.dto';
import { QueryCoinsListDto } from './dto/query-coins-list.dto';
import { QueryCoinsMarketsDto } from './dto/query-coins-markets.dto';
import { QueryCoinTickersDto } from './dto/query-coin-tickers.dto';
import { QueryCoinHistoryDto } from './dto/query-coin-history.dto';
import { QueryMarketChartDto } from './dto/query-market-chart.dto';
import { QueryMarketChartRangeDto } from './dto/query-market-chart-range.dto';
import { QueryOhlcDto } from './dto/query-ohlc.dto';
import { QueryCategoriesDto } from './dto/query-categories.dto';
import type {
  PingResponse,
  SimplePriceResponse,
  SimpleTokenPriceResponse,
  SupportedVsCurrenciesResponse,
  CoinsListResponse,
  CoinsMarketsResponse,
  CoinDataResponse,
  CoinTickersResponse,
  CoinHistoryResponse,
  MarketChartResponse,
  MarketChartRangeResponse,
  OhlcResponse,
  CoinContractResponse,
  ContractMarketChartResponse,
  ContractMarketChartRangeResponse,
  CategoriesListResponse,
  CategoriesResponse,
} from './types/coingecko-response.types';

@Injectable()
export class CryptoService implements OnModuleInit {
  constructor(private readonly httpService: HttpService) {}

  onModuleInit() {
    this.httpService.axiosRef.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const upstreamStatus = error.response.status;
          const errorBody = error.response.data as
            | { error?: string; status?: { error_message?: string } }
            | undefined;
          const coingeckoError =
            errorBody?.error ??
            errorBody?.status?.error_message ??
            error.message;

          throw new ProblemDetailsException({
            status: upstreamStatus,
            title: coingeckoError,
            detail: `CoinGecko API returned an error (${upstreamStatus})`,
            upstreamError: {
              status: upstreamStatus,
              body: errorBody,
            },
          });
        }
        throw error;
      },
    );
  }

  async ping() {
    const { data } = await this.httpService.axiosRef.get<PingResponse>('/ping');
    return data;
  }

  async simplePrice(query: QuerySimplePriceDto) {
    const { data } = await this.httpService.axiosRef.get<SimplePriceResponse>('/simple/price', {
      params: query,
    });
    return data;
  }

  async simpleTokenPrice(id: string, query: QuerySimpleTokenPriceDto) {
    const { data } = await this.httpService.axiosRef.get<SimpleTokenPriceResponse>(
      `/simple/token_price/${encodeURIComponent(id)}`,
      { params: query },
    );
    return data;
  }

  async supportedVsCurrencies() {
    const { data } = await this.httpService.axiosRef.get<SupportedVsCurrenciesResponse>(
      '/simple/supported_vs_currencies',
    );
    return data;
  }

  async coinsList(query: QueryCoinsListDto) {
    const { data } = await this.httpService.axiosRef.get<CoinsListResponse>('/coins/list', {
      params: query,
    });
    return data;
  }

  async coinsMarkets(query: QueryCoinsMarketsDto) {
    const { data } = await this.httpService.axiosRef.get<CoinsMarketsResponse>('/coins/markets', {
      params: query,
    });
    return data;
  }

  async coinData(
    id: string,
    query?: {
      localization?: boolean;
      tickers?: boolean;
      market_data?: boolean;
      community_data?: boolean;
      developer_data?: boolean;
      sparkline?: boolean;
    },
  ) {
    const { data } = await this.httpService.axiosRef.get<CoinDataResponse>(
      `/coins/${encodeURIComponent(id)}`,
      { params: query },
    );
    return data;
  }

  async coinTickers(id: string, query: QueryCoinTickersDto) {
    const { data } = await this.httpService.axiosRef.get<CoinTickersResponse>(
      `/coins/${encodeURIComponent(id)}/tickers`,
      { params: query },
    );
    return data;
  }

  async coinHistory(id: string, query: QueryCoinHistoryDto) {
    const { data } = await this.httpService.axiosRef.get<CoinHistoryResponse>(
      `/coins/${encodeURIComponent(id)}/history`,
      { params: query },
    );
    return data;
  }

  async coinMarketChart(id: string, query: QueryMarketChartDto) {
    const { data } = await this.httpService.axiosRef.get<MarketChartResponse>(
      `/coins/${encodeURIComponent(id)}/market_chart`,
      { params: query },
    );
    return data;
  }

  async coinMarketChartRange(
    id: string,
    query: QueryMarketChartRangeDto,
  ) {
    const { data } = await this.httpService.axiosRef.get<MarketChartRangeResponse>(
      `/coins/${encodeURIComponent(id)}/market_chart/range`,
      { params: query },
    );
    return data;
  }

  async coinOhlc(id: string, query: QueryOhlcDto) {
    const { data } = await this.httpService.axiosRef.get<OhlcResponse>(
      `/coins/${encodeURIComponent(id)}/ohlc`,
      { params: query },
    );
    return data;
  }

  async coinContract(id: string, contractAddress: string) {
    const { data } = await this.httpService.axiosRef.get<CoinContractResponse>(
      `/coins/${encodeURIComponent(id)}/contract/${encodeURIComponent(contractAddress)}`,
    );
    return data;
  }

  async coinContractMarketChart(
    id: string,
    contractAddress: string,
    query: QueryMarketChartDto,
  ) {
    const { data } = await this.httpService.axiosRef.get<ContractMarketChartResponse>(
      `/coins/${encodeURIComponent(id)}/contract/${encodeURIComponent(contractAddress)}/market_chart`,
      { params: query },
    );
    return data;
  }

  async coinContractMarketChartRange(
    id: string,
    contractAddress: string,
    query: QueryMarketChartRangeDto,
  ) {
    const { data } = await this.httpService.axiosRef.get<ContractMarketChartRangeResponse>(
      `/coins/${encodeURIComponent(id)}/contract/${encodeURIComponent(contractAddress)}/market_chart/range`,
      { params: query },
    );
    return data;
  }

  async categoriesList() {
    const { data } = await this.httpService.axiosRef.get<CategoriesListResponse>(
      '/coins/categories/list',
    );
    return data;
  }

  async categories(query: QueryCategoriesDto) {
    const { data } = await this.httpService.axiosRef.get<CategoriesResponse>('/coins/categories', {
      params: query,
    });
    return data;
  }
}
