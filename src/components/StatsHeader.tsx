import { FilteredCoin } from '@/types/binance';
import { TrendingDown, Coins, DollarSign, Activity } from 'lucide-react';

interface StatsHeaderProps {
  coins: FilteredCoin[];
  lastUpdate: Date | null;
}

export function StatsHeader({ coins, lastUpdate }: StatsHeaderProps) {
  const totalVolume = coins.reduce((sum, coin) => sum + coin.quoteVolume24h, 0);
  const avgDrop = coins.length > 0
    ? coins.reduce((sum, coin) => sum + coin.priceChangePercent, 0) / coins.length
    : 0;
  const maxDrop = coins.length > 0
    ? Math.min(...coins.map(c => c.priceChangePercent))
    : 0;

  const stats = [
    {
      icon: Coins,
      label: 'Số coin phù hợp',
      value: coins.length.toString(),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: DollarSign,
      label: 'Tổng Volume',
      value: `$${(totalVolume / 1_000_000).toFixed(1)}M`,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: TrendingDown,
      label: 'Giảm trung bình',
      value: `${avgDrop.toFixed(2)}%`,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      icon: Activity,
      label: 'Giảm mạnh nhất',
      value: `${maxDrop.toFixed(2)}%`,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
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
