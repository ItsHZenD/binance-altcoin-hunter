import { useState } from 'react';
import { useBinanceData } from '@/hooks/useBinanceData';
import { FilterSettings } from '@/types/binance';
import { FilterControls } from '@/components/FilterControls';
import { CoinTable } from '@/components/CoinTable';
import { StatsHeader } from '@/components/StatsHeader';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, TrendingDown, AlertCircle, Timer, TimerOff } from 'lucide-react';

const Index = () => {
  const [settings, setSettings] = useState<FilterSettings>({
    minVolume: 5,
    minPriceDropPercent: 3,
    quoteAsset: 'USDT',
    redCandleDays: 2,
  });
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { coins, loading, error, lastUpdate, refetch } = useBinanceData(settings, autoRefresh);

  return (
    <div className="min-h-screen bg-background">
      {/* Background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/50 pulse-glow">
                  <TrendingDown className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">
                    <span className="gradient-text">Futures</span> Scanner
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Lọc coin Binance Futures đang giảm giá mạnh
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Auto refresh toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      autoRefresh 
                        ? 'bg-primary/10 text-primary border border-primary/30' 
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}
                  >
                    {autoRefresh ? (
                      <>
                        <Timer className="w-4 h-4" />
                        <span className="hidden sm:inline">Tự động</span>
                      </>
                    ) : (
                      <>
                        <TimerOff className="w-4 h-4" />
                        <span className="hidden sm:inline">Tắt</span>
                      </>
                    )}
                  </button>
                </div>

                {lastUpdate && (
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {lastUpdate.toLocaleTimeString('vi-VN')}
                  </span>
                )}
                <Button
                  onClick={refetch}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Làm mới</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Filter controls */}
          <FilterControls settings={settings} onSettingsChange={setSettings} />

          {/* Error state */}
          {error && (
            <div className="glass-card p-6 border-destructive/30 fade-in">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Lỗi tải dữ liệu</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && !coins.length && <LoadingSkeleton />}

          {/* Data display */}
          {!loading && !error && (
            <>
              <StatsHeader coins={coins} lastUpdate={lastUpdate} />
              <CoinTable coins={coins} />
            </>
          )}

          {/* Auto-refresh indicator */}
          {!loading && coins.length > 0 && (
            <p className="text-center text-sm text-muted-foreground">
              {autoRefresh 
                ? 'Dữ liệu tự động cập nhật mỗi 30 giây' 
                : 'Tự động cập nhật đã tắt - Nhấn "Làm mới" để cập nhật'}
            </p>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card/30 mt-12">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            <p>Dữ liệu từ Binance Futures API • Chỉ mang tính chất tham khảo</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
