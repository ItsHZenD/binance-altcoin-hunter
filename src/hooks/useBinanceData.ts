import { useState, useEffect, useCallback, useRef } from 'react';
import { BinanceTicker, FilteredCoin, FilterSettings } from '@/types/binance';

const BINANCE_FUTURES_API = 'https://fapi.binance.com/fapi/v1/ticker/24hr';
const BINANCE_KLINES_API = 'https://fapi.binance.com/fapi/v1/klines';

// Count consecutive red candles from the most recent days
async function countRedCandles(symbol: string, days: number): Promise<number> {
  try {
    const response = await fetch(
      `${BINANCE_KLINES_API}?symbol=${symbol}&interval=1d&limit=${days}`
    );
    if (!response.ok) return 0;
    
    const klines = await response.json();
    if (klines.length < days) return 0;
    
    // Kline format: [openTime, open, high, low, close, volume, ...]
    const isRedCandle = (kline: any[]) => parseFloat(kline[4]) < parseFloat(kline[1]);
    
    let redCount = 0;
    for (const kline of klines) {
      if (isRedCandle(kline)) {
        redCount++;
      }
    }
    
    return redCount;
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

        // Check price drop (negative percentage, greater than threshold)
        const priceChangePercent = parseFloat(ticker.priceChangePercent);
        if (priceChangePercent >= -settings.minPriceDropPercent) return false;

        return true;
      });

      // Check for red candles for each coin (batch with rate limit consideration)
      const coinsWithCandles = await Promise.all(
        preFiltered.map(async (ticker): Promise<FilteredCoin> => {
          const redCandleCount = await countRedCandles(ticker.symbol, settings.redCandleDays);
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
            redCandleCount,
          };
        })
      );

      // Only include coins with required number of red candles
      const filtered = coinsWithCandles
        .filter((coin) => coin.redCandleCount >= settings.redCandleDays)
        .sort((a, b) => a.priceChangePercent - b.priceChangePercent);

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
