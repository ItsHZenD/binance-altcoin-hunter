import { FilterSettings, FilterMode } from '@/types/binance';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings2, TrendingDown, TrendingUp } from 'lucide-react';

interface FilterControlsProps {
  settings: FilterSettings;
  onSettingsChange: (settings: FilterSettings) => void;
}

export function FilterControls({ settings, onSettingsChange }: FilterControlsProps) {
  const isBearish = settings.mode === 'bearish';

  return (
    <div className="glass-card p-6 fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Settings2 className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">Bộ lọc</h2>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() =>
            onSettingsChange({ ...settings, mode: 'bearish' })
          }
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isBearish
              ? 'bg-destructive/20 text-destructive border border-destructive/40'
              : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          Coin giảm
        </button>
        <button
          onClick={() =>
            onSettingsChange({ ...settings, mode: 'bullish' })
          }
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            !isBearish
              ? 'bg-green-500/20 text-green-500 border border-green-500/40'
              : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Coin tăng
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="minVolume" className="text-muted-foreground">
            Volume 24h tối thiểu (triệu USD)
          </Label>
          <Input
            id="minVolume"
            type="number"
            value={settings.minVolume}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                minVolume: parseFloat(e.target.value) || 0,
              })
            }
            className="font-mono bg-secondary border-border focus:border-primary"
            min={0}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minPriceChange" className="text-muted-foreground">
            {isBearish ? 'Giảm giá 24h tối thiểu (%)' : 'Tăng giá 24h tối thiểu (%)'}
          </Label>
          <Input
            id="minPriceChange"
            type="number"
            value={settings.minPriceChangePercent}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                minPriceChangePercent: parseFloat(e.target.value) || 0,
              })
            }
            className="font-mono bg-secondary border-border focus:border-primary"
            min={0}
            step={0.5}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="candleDays" className="text-muted-foreground">
            {isBearish ? 'Số ngày nến đỏ liên tiếp' : 'Số ngày nến xanh liên tiếp'}
          </Label>
          <Select
            value={settings.candleDays.toString()}
            onValueChange={(value) =>
              onSettingsChange({
                ...settings,
                candleDays: parseInt(value),
              })
            }
          >
            <SelectTrigger className="font-mono bg-secondary border-border focus:border-primary">
              <SelectValue placeholder="Chọn số ngày" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  {day} ngày
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
