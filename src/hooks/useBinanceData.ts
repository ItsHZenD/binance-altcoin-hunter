import { useState, useEffect, useCallback, useRef } from 'react';
import { BinanceTicker, FilteredCoin, FilterSettings } from '@/types/binance';

const BINANCE_FUTURES_API = 'https://fapi.binance.com/fapi/v1/ticker/24hr';

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

      // Filter coins
      const filtered = data
        .filter((ticker) => {
          // Only include pairs with specified quote asset (USDT)
          if (!ticker.symbol.endsWith(settings.quoteAsset)) return false;

          // Check volume (quoteVolume is in USDT)
          const quoteVolume = parseFloat(ticker.quoteVolume);
          if (quoteVolume < settings.minVolume * 1_000_000) return false;

          // Check price drop (negative percentage, greater than threshold)
          const priceChangePercent = parseFloat(ticker.priceChangePercent);
          if (priceChangePercent >= -settings.minPriceDropPercent) return false;

          return true;
        })
        .map((ticker): FilteredCoin => ({
          symbol: ticker.symbol,
          baseAsset: ticker.symbol.replace(settings.quoteAsset, ''),
          quoteAsset: settings.quoteAsset,
          lastPrice: parseFloat(ticker.lastPrice),
          priceChangePercent: parseFloat(ticker.priceChangePercent),
          volume24h: parseFloat(ticker.volume),
          quoteVolume24h: parseFloat(ticker.quoteVolume),
          highPrice: parseFloat(ticker.highPrice),
          lowPrice: parseFloat(ticker.lowPrice),
        }))
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
