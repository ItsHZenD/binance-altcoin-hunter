import { FilteredCoin, FilterMode } from '@/types/binance';
import { TrendingDown, TrendingUp, Coins, DollarSign, Activity } from 'lucide-react';

interface StatsHeaderProps {
  coins: FilteredCoin[];
  lastUpdate: Date | null;
  mode: FilterMode;
}

export function StatsHeader({ coins, lastUpdate, mode }: StatsHeaderProps) {
  const isBearish = mode === 'bearish';
  
  const totalVolume = coins.reduce((sum, coin) => sum + coin.quoteVolume24h, 0);
  const avgChange = coins.length > 0
    ? coins.reduce((sum, coin) => sum + coin.priceChangePercent, 0) / coins.length
    : 0;
  const extremeChange = coins.length > 0
    ? isBearish 
      ? Math.min(...coins.map(c => c.priceChangePercent))
      : Math.max(...coins.map(c => c.priceChangePercent))
    : 0;

  const TrendIcon = isBearish ? TrendingDown : TrendingUp;
  const trendColor = isBearish ? 'text-destructive' : 'text-green-500';
  const trendBg = isBearish ? 'bg-destructive/10' : 'bg-green-500/10';

  const stats = [
    {
      icon: Coins,
      label: 'Số coin phù hợp',
      value: coins.length.toString(),
      color: isBearish ? 'text-destructive' : 'text-green-500',
      bgColor: isBearish ? 'bg-destructive/10' : 'bg-green-500/10',
    },
    {
      icon: DollarSign,
      label: 'Tổng Volume',
      value: `$${(totalVolume / 1_000_000).toFixed(1)}M`,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: TrendIcon,
      label: isBearish ? 'Giảm trung bình' : 'Tăng trung bình',
      value: `${isBearish ? '' : '+'}${avgChange.toFixed(2)}%`,
      color: trendColor,
      bgColor: trendBg,
    },
    {
      icon: Activity,
      label: isBearish ? 'Giảm mạnh nhất' : 'Tăng mạnh nhất',
      value: `${isBearish ? '' : '+'}${extremeChange.toFixed(2)}%`,
      color: trendColor,
      bgColor: trendBg,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 fade-in">
      {stats.map((stat) => (
        <div key={stat.label} className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
