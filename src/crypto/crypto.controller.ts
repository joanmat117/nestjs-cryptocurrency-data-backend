import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CryptoService } from './crypto.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
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
@ApiTags('Cryptocurrency')
@Controller('crypto')
// @UseGuards(AuthGuard)
@ApiBearerAuth()
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) { }

  @Get('ping')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'CoinGecko API ping',
    description: 'Checks the CoinGecko API server status.',
  })
  @ApiResponse({ status: 200, description: 'Ping successful' })
  async ping() {
    const data = await this.cryptoService.ping();
    return { message: 'success', data };
  }

  @Get('simple/price')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Simple price',
    description: 'Get current price of one or more coins by ID.',
  })
  @ApiResponse({ status: 200, description: 'Price data retrieved' })
  async simplePrice(@Query() query: QuerySimplePriceDto) {
    const data = await this.cryptoService.simplePrice(query);
    return { message: 'success', data };
  }

  @Get('simple/token-price/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Token price by contract addresses',
    description: 'Get token prices using contract addresses on a specific asset platform.',
  })
  @ApiResponse({ status: 200, description: 'Token price data retrieved' })
  async simpleTokenPrice(@Param('id') id: string, @Query() query: QuerySimpleTokenPriceDto) {
    const data = await this.cryptoService.simpleTokenPrice(id, query);
    return { message: 'success', data };
  }

  @Get('simple/supported-vs-currencies')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supported vs currencies',
    description: 'List all supported vs currencies on CoinGecko.',
  })
  @ApiResponse({ status: 200, description: 'Supported currencies retrieved' })
  async supportedVsCurrencies() {
    const data = await this.cryptoService.supportedVsCurrencies();
    return { message: 'success', data };
  }

  @Get('coins/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Coins list (ID map)',
    description: 'List all supported coins with ID, name, and symbol.',
  })
  @ApiResponse({ status: 200, description: 'Coins list retrieved' })
  async coinsList(@Query() query: QueryCoinsListDto) {
    const data = await this.cryptoService.coinsList(query);
    return { message: 'success', data };
  }

  @Get('coins/markets')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Coins markets',
    description: 'List all supported coins with price, market cap, volume, and market data.',
  })
  @ApiResponse({ status: 200, description: 'Markets data retrieved' })
  async coinsMarkets(@Query() query: QueryCoinsMarketsDto) {
    const data = await this.cryptoService.coinsMarkets(query);
    return { message: 'success', data };
  }

  @Get('coins/categories/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Categories list',
    description: 'List all coin categories on CoinGecko.',
  })
  @ApiResponse({ status: 200, description: 'Categories list retrieved' })
  async categoriesList() {
    const data = await this.cryptoService.categoriesList();
    return { message: 'success', data };
  }

  @Get('coins/categories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Categories with market data',
    description: 'List all coin categories with market data (market cap, volume, etc.).',
  })
  @ApiResponse({ status: 200, description: 'Categories with market data retrieved' })
  async categories(@Query() query: QueryCategoriesDto) {
    const data = await this.cryptoService.categories(query);
    return { message: 'success', data };
  }

  @Get('coins/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Coin data by ID',
    description: 'Get all metadata and market data for a coin by ID.',
  })
  @ApiResponse({ status: 200, description: 'Coin data retrieved' })
  async coinData(@Param('id') id: string) {
    const data = await this.cryptoService.coinData(id);
    return { message: 'success', data };
  }

  @Get('coins/:id/tickers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Coin tickers by ID',
    description: 'Get coin tickers on both CEX and DEX exchanges.',
  })
  @ApiResponse({ status: 200, description: 'Tickers retrieved' })
  async coinTickers(@Param('id') id: string, @Query() query: QueryCoinTickersDto) {
    const data = await this.cryptoService.coinTickers(id, query);
    return { message: 'success', data };
  }

  @Get('coins/:id/history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Coin historical data by ID',
    description: 'Get historical data (price, market cap, volume) at a given date.',
  })
  @ApiResponse({ status: 200, description: 'Historical data retrieved' })
  async coinHistory(@Param('id') id: string, @Query() query: QueryCoinHistoryDto) {
    const data = await this.cryptoService.coinHistory(id, query);
    return { message: 'success', data };
  }

  @Get('coins/:id/market-chart/range')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Coin market chart range',
    description: 'Get historical chart data within a custom time range.',
  })
  @ApiResponse({ status: 200, description: 'Market chart range data retrieved' })
  async coinMarketChartRange(@Param('id') id: string, @Query() query: QueryMarketChartRangeDto) {
    const data = await this.cryptoService.coinMarketChartRange(id, query);
    return { message: 'success', data };
  }

  @Get('coins/:id/market-chart')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Coin market chart',
    description: 'Get historical chart data (price, market cap, volume) for a coin.',
  })
  @ApiResponse({ status: 200, description: 'Market chart data retrieved' })
  async coinMarketChart(@Param('id') id: string, @Query() query: QueryMarketChartDto) {
    const data = await this.cryptoService.coinMarketChart(id, query);
    return { message: 'success', data };
  }

  @Get('coins/:id/ohlc')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Coin OHLC chart',
    description: 'Get OHLC (Open, High, Low, Close) chart data for a coin.',
  })
  @ApiResponse({ status: 200, description: 'OHLC data retrieved' })
  async coinOhlc(@Param('id') id: string, @Query() query: QueryOhlcDto) {
    const data = await this.cryptoService.coinOhlc(id, query);
    return { message: 'success', data };
  }

  @Get('coins/:id/contract/:contractAddress/market-chart/range')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Contract market chart range',
    description: 'Get historical chart data for a token by contract address within a custom range.',
  })
  @ApiResponse({ status: 200, description: 'Contract market chart range data retrieved' })
  async coinContractMarketChartRange(
    @Param('id') id: string,
    @Param('contractAddress') contractAddress: string,
    @Query() query: QueryMarketChartRangeDto,
  ) {
    const data = await this.cryptoService.coinContractMarketChartRange(id, contractAddress, query);
    return { message: 'success', data };
  }

  @Get('coins/:id/contract/:contractAddress/market-chart')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Contract market chart',
    description: 'Get historical chart data for a token by contract address.',
  })
  @ApiResponse({ status: 200, description: 'Contract market chart data retrieved' })
  async coinContractMarketChart(
    @Param('id') id: string,
    @Param('contractAddress') contractAddress: string,
    @Query() query: QueryMarketChartDto,
  ) {
    const data = await this.cryptoService.coinContractMarketChart(id, contractAddress, query);
    return { message: 'success', data };
  }

  @Get('coins/:id/contract/:contractAddress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Contract coin data',
    description: 'Get coin metadata and market data by contract address.',
  })
  @ApiResponse({ status: 200, description: 'Contract coin data retrieved' })
  async coinContract(@Param('id') id: string, @Param('contractAddress') contractAddress: string) {
    const data = await this.cryptoService.coinContract(id, contractAddress);
    return { message: 'success', data };
  }
}
