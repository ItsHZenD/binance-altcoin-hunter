import { FilteredCoin } from '@/types/binance';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingDown, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CoinTableProps {
  coins: FilteredCoin[];
}

function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(decimals) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(decimals) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(decimals) + 'K';
  }
  return num.toFixed(decimals);
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  if (price >= 0.0001) return price.toFixed(6);
  return price.toFixed(8);
}

export function CoinTable({ coins }: CoinTableProps) {
  if (coins.length === 0) {
    return (
      <div className="glass-card p-12 text-center fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <TrendingDown className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Không tìm thấy coin nào</h3>
        <p className="text-muted-foreground">
          Thử điều chỉnh bộ lọc để tìm kiếm thêm
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden fade-in">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-semibold">#</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Coin</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-right">Giá</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-right">Thay đổi 24h</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-right">Volume 24h</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-right">Cao/Thấp 24h</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-center">Binance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coins.map((coin, index) => (
              <TableRow key={coin.symbol} className="table-row-hover border-border">
                <TableCell className="font-mono text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary">
                      {coin.baseAsset.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold">{coin.baseAsset}</div>
                      <div className="text-sm text-muted-foreground">{coin.symbol}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  ${formatPrice(coin.lastPrice)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge 
                    variant="outline" 
                    className="font-mono border-destructive/30 bg-destructive/10 text-destructive"
                  >
                    <TrendingDown className="w-3 h-3 mr-1" />
                    {coin.priceChangePercent.toFixed(2)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  <div className="text-foreground">${formatNumber(coin.quoteVolume24h)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatNumber(coin.volume24h)} {coin.baseAsset}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  <div className="text-success">${formatPrice(coin.highPrice)}</div>
                  <div className="text-destructive">${formatPrice(coin.lowPrice)}</div>
                </TableCell>
                <TableCell className="text-center">
                  <a
                    href={`https://www.binance.com/vi/futures/${coin.baseAsset}${coin.quoteAsset}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
