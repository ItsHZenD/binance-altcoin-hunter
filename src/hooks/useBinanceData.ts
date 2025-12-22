import { useState, useEffect, useCallback } from 'react';
import { BinanceTicker, FilteredCoin, FilterSettings } from '@/types/binance';

const BINANCE_API = 'https://api.binance.com/api/v3/ticker/24hr';

const STABLECOINS = ['USDT', 'USDC', 'BUSD', 'TUSD', 'DAI', 'FDUSD'];
const EXCLUDED_ASSETS = ['BTC', 'ETH', 'BNB', ...STABLECOINS];

export function useBinanceData(settings: FilterSettings) {
  const [coins, setCoins] = useState<FilteredCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(BINANCE_API);
      if (!response.ok) {
        throw new Error('Failed to fetch Binance data');
      }

      const data: BinanceTicker[] = await response.json();

      // Filter coins
      const filtered = data
        .filter((ticker) => {
          // Only include pairs with specified quote asset (USDT)
          if (!ticker.symbol.endsWith(settings.quoteAsset)) return false;

          // Extract base asset
          const baseAsset = ticker.symbol.replace(settings.quoteAsset, '');

          // Exclude major coins and stablecoins
          if (EXCLUDED_ASSETS.includes(baseAsset)) return false;

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

    // Auto refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { coins, loading, error, lastUpdate, refetch: fetchData };
}
