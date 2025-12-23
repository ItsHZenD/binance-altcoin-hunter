import { useState, useEffect, useCallback, useRef } from 'react';
import { BinanceTicker, FilteredCoin, FilterSettings } from '@/types/binance';

const BINANCE_FUTURES_API = 'https://fapi.binance.com/fapi/v1/ticker/24hr';
const BINANCE_KLINES_API = 'https://fapi.binance.com/fapi/v1/klines';

// Check if the last 2 daily candles are red (close < open)
async function checkTwoRedCandles(symbol: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${BINANCE_KLINES_API}?symbol=${symbol}&interval=1d&limit=2`
    );
    if (!response.ok) return false;
    
    const klines = await response.json();
    if (klines.length < 2) return false;
    
    // Kline format: [openTime, open, high, low, close, volume, ...]
    const isRedCandle = (kline: any[]) => parseFloat(kline[4]) < parseFloat(kline[1]);
    
    return isRedCandle(klines[0]) && isRedCandle(klines[1]);
  } catch {
    return false;
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

      // Check for 2 red candles for each coin (batch with rate limit consideration)
      const coinsWithCandles = await Promise.all(
        preFiltered.map(async (ticker): Promise<FilteredCoin> => {
          const hasTwoRedCandles = await checkTwoRedCandles(ticker.symbol);
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
            hasTwoRedCandles,
          };
        })
      );

      // Only include coins with 2 red candles
      const filtered = coinsWithCandles
        .filter((coin) => coin.hasTwoRedCandles)
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
