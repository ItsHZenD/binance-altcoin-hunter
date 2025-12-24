export interface BinanceTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export type FilterMode = 'bearish' | 'bullish';

export interface FilteredCoin {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice: number;
  priceChangePercent: number;
  volume24h: number;
  quoteVolume24h: number;
  highPrice: number;
  lowPrice: number;
  candleCount: number; // red candles for bearish, green candles for bullish
}

export interface KlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
}

export interface FilterSettings {
  mode: FilterMode;
  minVolume: number;
  minPriceChangePercent: number; // drop for bearish, gain for bullish
  quoteAsset: string;
  candleDays: number;
}
