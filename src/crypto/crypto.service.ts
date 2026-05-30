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

  async ping(): Promise<any> {
    const { data } = await this.httpService.axiosRef.get('/ping');
    return data;
  }

  async simplePrice(query: QuerySimplePriceDto): Promise<any> {
    const { data } = await this.httpService.axiosRef.get('/simple/price', {
      params: query,
    });
    return data;
  }

  async simpleTokenPrice(id: string, query: QuerySimpleTokenPriceDto): Promise<any> {
    const { data } = await this.httpService.axiosRef.get(
      `/simple/token_price/${encodeURIComponent(id)}`,
      { params: query },
    );
    return data;
  }

  async supportedVsCurrencies(): Promise<any> {
    const { data } = await this.httpService.axiosRef.get(
      '/simple/supported_vs_currencies',
    );
    return data;
  }

  async coinsList(query: QueryCoinsListDto): Promise<any> {
    const { data } = await this.httpService.axiosRef.get('/coins/list', {
      params: query,
    });
    return data;
  }

  async coinsMarkets(query: QueryCoinsMarketsDto): Promise<any> {
    const { data } = await this.httpService.axiosRef.get('/coins/markets', {
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
  ): Promise<any> {
    const { data } = await this.httpService.axiosRef.get(
      `/coins/${encodeURIComponent(id)}`,
      { params: query },
    );
    return data;
  }

  async coinTickers(id: string, query: QueryCoinTickersDto): Promise<any> {
    const { data } = await this.httpService.axiosRef.get(
      `/coins/${encodeURIComponent(id)}/tickers`,
      { params: query },
    );
    return data;
  }

  async coinHistory(id: string, query: QueryCoinHistoryDto): Promise<any> {
    const { data } = await this.httpService.axiosRef.get(
      `/coins/${encodeURIComponent(id)}/history`,
      { params: query },
    );
    return data;
  }

  async coinMarketChart(id: string, query: QueryMarketChartDto): Promise<any> {
    const { data } = await this.httpService.axiosRef.get(
      `/coins/${encodeURIComponent(id)}/market_chart`,
      { params: query },
    );
    return data;
  }

  async coinMarketChartRange(
    id: string,
    query: QueryMarketChartRangeDto,
  ): Promise<any> {
    const { data } = await this.httpService.axiosRef.get(
      `/coins/${encodeURIComponent(id)}/market_chart/range`,
      { params: query },
    );
    return data;
  }

  async coinOhlc(id: string, query: QueryOhlcDto): Promise<any> {
    const { data } = await this.httpService.axiosRef.get(
      `/coins/${encodeURIComponent(id)}/ohlc`,
      { params: query },
    );
    return data;
  }

  async coinContract(id: string, contractAddress: string): Promise<any> {
    const { data } = await this.httpService.axiosRef.get(
      `/coins/${encodeURIComponent(id)}/contract/${encodeURIComponent(contractAddress)}`,
    );
    return data;
  }

  async coinContractMarketChart(
    id: string,
    contractAddress: string,
    query: QueryMarketChartDto,
  ): Promise<any> {
    const { data } = await this.httpService.axiosRef.get(
      `/coins/${encodeURIComponent(id)}/contract/${encodeURIComponent(contractAddress)}/market_chart`,
      { params: query },
    );
    return data;
  }

  async coinContractMarketChartRange(
    id: string,
    contractAddress: string,
    query: QueryMarketChartRangeDto,
  ): Promise<any> {
    const { data } = await this.httpService.axiosRef.get(
      `/coins/${encodeURIComponent(id)}/contract/${encodeURIComponent(contractAddress)}/market_chart/range`,
      { params: query },
    );
    return data;
  }

  async categoriesList(): Promise<any> {
    const { data } = await this.httpService.axiosRef.get(
      '/coins/categories/list',
    );
    return data;
  }

  async categories(query: QueryCategoriesDto): Promise<any> {
    const { data } = await this.httpService.axiosRef.get('/coins/categories', {
      params: query,
    });
    return data;
  }
}
