// ---------------------------------------------------------------------------
// CoinGecko API Response Types (keyless public API v3)
// Sources: https://docs.coingecko.com/reference/
// ---------------------------------------------------------------------------

// ---- 1. /ping ----
export interface PingResponse {
  gecko_says: string;
}

// ---- 2. /simple/price ----
export interface SimplePriceData {
  [currency: string]: number | undefined;
  last_updated_at?: number;
}

export type SimplePriceResponse = Record<string, SimplePriceData>;

// ---- 3. /simple/token_price/{id} ----
export interface SimpleTokenPriceEntry {
  usd?: number;
  usd_market_cap?: number;
  usd_24h_vol?: number;
  usd_24h_change?: number;
  last_updated_at?: number;
  [currency: string]: number | undefined;
}

export type SimpleTokenPriceResponse = Record<string, SimpleTokenPriceEntry>;

// ---- 4. /simple/supported_vs_currencies ----
export type SupportedVsCurrenciesResponse = string[];

// ---- 5. /coins/list ----
export interface CoinListItem {
  id: string;
  symbol: string;
  name: string;
  platforms?: Record<string, string | null>;
}

export type CoinsListResponse = CoinListItem[];

// ---- 6. /coins/markets ----
export interface RoiData {
  times?: number;
  currency?: string;
  percentage?: number;
}

export interface CoinsMarketsItem {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap: number | null;
  market_cap_rank: number | null;
  market_cap_rank_with_rehypothecated?: number | null;
  fully_diluted_valuation: number | null;
  total_volume: number | null;
  high_24h: number | null;
  low_24h: number | null;
  price_change_24h: number | null;
  price_change_percentage_24h: number | null;
  market_cap_change_24h: number | null;
  market_cap_change_percentage_24h: number | null;
  circulating_supply: number | null;
  total_supply: number | null;
  max_supply: number | null;
  ath: number | null;
  ath_change_percentage: number | null;
  ath_date: string | null;
  atl: number | null;
  atl_change_percentage: number | null;
  atl_date: string | null;
  roi: RoiData | null;
  last_updated: string;
  sparkline_in_7d?: { price: number[] };
}

export type CoinsMarketsResponse = CoinsMarketsItem[];

// ---- 7. /coins/{id} ----
export interface CoinImage {
  thumb: string;
  small: string;
  large: string;
}

export interface CoinLinks {
  homepage: string[];
  whitepaper?: string;
  blockchain_site: string[];
  official_forum_url: string[];
  chat_url: string[];
  announcement_url: string[];
  twitter_screen_name?: string;
  facebook_username?: string;
  telegram_channel_identifier?: string;
  subreddit_url?: string;
  repos_url: {
    github: string[];
    bitbucket: string[];
  };
}

export interface CoinMarketData {
  current_price: Record<string, number>;
  total_value_locked: number | null;
  mcap_to_tvl_ratio: number | null;
  fdv_to_tvl_ratio: number | null;
  roi: RoiData | null;
  ath: Record<string, number>;
  ath_change_percentage: Record<string, number>;
  ath_date: Record<string, string>;
  atl: Record<string, number>;
  atl_change_percentage: Record<string, number>;
  atl_date: Record<string, string>;
  market_cap: Record<string, number>;
  market_cap_rank: number;
  fully_diluted_valuation: Record<string, number>;
  total_volume: Record<string, number>;
  high_24h: Record<string, number>;
  low_24h: Record<string, number>;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  price_change_percentage_14d: number;
  price_change_percentage_30d: number;
  price_change_percentage_60d: number;
  price_change_percentage_200d: number;
  price_change_percentage_1y: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  total_supply: number | null;
  max_supply: number | null;
  circulating_supply: number;
  sparkline_7d?: { price: number[] };
  last_updated: string;
}

export interface CommunityData {
  facebook_likes: number | null;
  reddit_average_posts_48h: number;
  reddit_average_comments_48h: number;
  reddit_subscribers: number;
  reddit_accounts_active_48h: number;
  telegram_channel_user_count: number | null;
}

export interface DeveloperData {
  forks: number;
  stars: number;
  subscribers: number;
  total_issues: number;
  closed_issues: number;
  pull_requests_merged: number;
  pull_request_contributors: number;
  code_additions_deletions_4_weeks: { additions: number; deletions: number };
  commit_count_4_weeks: number;
}

export interface TickerMarket {
  name: string;
  identifier: string;
  has_trading_incentive: boolean;
  logo?: string;
}

export interface Ticker {
  base: string;
  target: string;
  market: TickerMarket;
  last: number;
  volume: number;
  cost_to_move_up_usd?: number;
  cost_to_move_down_usd?: number;
  converted_last: { btc: number; eth: number; usd: number };
  converted_volume: { btc: number; eth: number; usd: number };
  trust_score: string | null;
  bid_ask_spread_percentage: number;
  timestamp: string;
  last_traded_at: string;
  last_fetch_at: string;
  is_anomaly: boolean;
  is_stale: boolean;
  trade_url: string;
  token_info_url: string | null;
  coin_id: string;
  target_coin_id: string;
  coin_mcap_usd: number;
}

export interface CoinDataResponse {
  id: string;
  symbol: string;
  name: string;
  web_slug?: string;
  asset_platform_id: string | null;
  platforms: Record<string, string>;
  detail_platforms: Record<string, { decimal_place: number | null; contract_address: string }>;
  block_time_in_minutes: number;
  hashing_algorithm: string;
  categories: string[];
  preview_listing: boolean;
  public_notice: string | null;
  additional_notices: string[];
  localization: Record<string, string>;
  description: Record<string, string>;
  links: CoinLinks;
  image: CoinImage;
  country_origin: string;
  genesis_date: string;
  sentiment_votes_up_percentage: number;
  sentiment_votes_down_percentage: number;
  watchlist_portfolio_users: number;
  market_cap_rank: number;
  market_data: CoinMarketData;
  community_data: CommunityData;
  developer_data: DeveloperData;
  status_updates: unknown[];
  last_updated: string;
  tickers: Ticker[];
}

// ---- 8. /coins/{id}/tickers ----
export interface CoinTickersResponse {
  name: string;
  tickers: Ticker[];
}

// ---- 9. /coins/{id}/history ----
export interface CoinHistoryMarketData {
  current_price: Record<string, number>;
  market_cap: Record<string, number>;
  total_volume: Record<string, number>;
}

export interface CoinHistoryResponse {
  id: string;
  symbol: string;
  name: string;
  localization: Record<string, string>;
  image: {
    thumb: string;
    small: string;
  };
  market_data: CoinHistoryMarketData;
  community_data: CommunityData;
  developer_data: DeveloperData;
  public_interest_stats: {
    alexa_rank: number | null;
    bing_matches: number | null;
  };
}

// ---- 10. /coins/{id}/market_chart ----
export interface MarketChartResponse {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

// ---- 11. /coins/{id}/market_chart/range ----
export type MarketChartRangeResponse = MarketChartResponse;

// ---- 12. /coins/{id}/ohlc ----
// Each entry: [timestamp, open, high, low, close]
export type OhlcResponse = [number, number, number, number, number][];

// ---- 13. /coins/{id}/contract/{contract_address} ----
export type CoinContractResponse = CoinDataResponse;

// ---- 14. /coins/{id}/contract/{contract_address}/market_chart ----
export type ContractMarketChartResponse = MarketChartResponse;

// ---- 15. /coins/{id}/contract/{contract_address}/market_chart/range ----
export type ContractMarketChartRangeResponse = MarketChartResponse;

// ---- 16. /coins/categories/list ----
export interface CategoryListItem {
  category_id: string;
  name: string;
}

export type CategoriesListResponse = CategoryListItem[];

// ---- 17. /coins/categories ----
export interface CategoryWithMarketData {
  id: string;
  name: string;
  market_cap: number;
  market_cap_change_24h: number;
  content: string;
  top_3_coins_id: string[];
  top_3_coins: string[];
  volume_24h: number;
  updated_at: string;
}

export type CategoriesResponse = CategoryWithMarketData[];
