import { useState, useEffect, useCallback, useRef } from 'react';
import { BinanceTicker, FilteredCoin, FilterSettings, FilterMode } from '@/types/binance';

const BINANCE_FUTURES_API = 'https://fapi.binance.com/fapi/v1/ticker/24hr';
const BINANCE_KLINES_API = 'https://fapi.binance.com/fapi/v1/klines';

// Count candles of specified color from the most recent days
async function countCandles(symbol: string, days: number, mode: FilterMode): Promise<number> {
  try {
    const response = await fetch(
      `${BINANCE_KLINES_API}?symbol=${symbol}&interval=1d&limit=${days}`
    );
    if (!response.ok) return 0;
    
    const klines = await response.json();
    if (klines.length < days) return 0;
    
    // Kline format: [openTime, open, high, low, close, volume, ...]
    const isTargetCandle = (kline: any[]) => {
      const close = parseFloat(kline[4]);
      const open = parseFloat(kline[1]);
      return mode === 'bearish' ? close < open : close > open;
    };
    
    let count = 0;
    for (const kline of klines) {
      if (isTargetCandle(kline)) {
        count++;
      }
    }
    
    return count;
  } catch {
    return 0;
  }
}

export function useBinanceData(settings: FilterSettings, autoRefresh: boolean = true) {
  const [coins, setCoins] = useState<FilteredCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(BINANCE_FUTURES_API);
      if (!response.ok) {
        throw new Error('Failed to fetch Binance Futures data');
      }

      const data: BinanceTicker[] = await response.json();

      // Filter coins - exclude delisted (no trades, zero volume) and apply criteria
      const preFiltered = data.filter((ticker) => {
        // Exclude delisted coins (no trades or zero volume)
        if (ticker.count === 0 || parseFloat(ticker.volume) === 0) return false;
        
        // Only include pairs with specified quote asset (USDT)
        if (!ticker.symbol.endsWith(settings.quoteAsset)) return false;

        // Check volume (quoteVolume is in USDT)
        const quoteVolume = parseFloat(ticker.quoteVolume);
        if (quoteVolume < settings.minVolume * 1_000_000) return false;

        // Check price change based on mode
        const priceChangePercent = parseFloat(ticker.priceChangePercent);
        if (settings.mode === 'bearish') {
          // For bearish: price must have dropped by at least the threshold
          if (priceChangePercent >= -settings.minPriceChangePercent) return false;
        } else {
          // For bullish: price must have gained by at least the threshold
          if (priceChangePercent <= settings.minPriceChangePercent) return false;
        }

        return true;
      });

      // Check for candles for each coin
      const coinsWithCandles = await Promise.all(
        preFiltered.map(async (ticker): Promise<FilteredCoin> => {
          const candleCount = await countCandles(ticker.symbol, settings.candleDays, settings.mode);
          return {
            symbol: ticker.symbol,
            baseAsset: ticker.symbol.replace(settings.quoteAsset, ''),
            quoteAsset: settings.quoteAsset,
            lastPrice: parseFloat(ticker.lastPrice),
            priceChangePercent: parseFloat(ticker.priceChangePercent),
            volume24h: parseFloat(ticker.volume),
            quoteVolume24h: parseFloat(ticker.quoteVolume),
            highPrice: parseFloat(ticker.highPrice),
            lowPrice: parseFloat(ticker.lowPrice),
            candleCount,
          };
        })
      );

      // Only include coins with required number of candles
      const filtered = coinsWithCandles
        .filter((coin) => coin.candleCount >= settings.candleDays)
        .sort((a, b) => 
          settings.mode === 'bearish' 
            ? a.priceChangePercent - b.priceChangePercent  // Most negative first
            : b.priceChangePercent - a.priceChangePercent  // Most positive first
        );

      setCoins(filtered);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [settings]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Set new interval if auto refresh is enabled
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchData, 30000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, fetchData]);

  return { coins, loading, error, lastUpdate, refetch: fetchData };
}
