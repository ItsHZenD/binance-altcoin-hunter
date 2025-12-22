import { FilterSettings } from '@/types/binance';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings2 } from 'lucide-react';

interface FilterControlsProps {
  settings: FilterSettings;
  onSettingsChange: (settings: FilterSettings) => void;
}

export function FilterControls({ settings, onSettingsChange }: FilterControlsProps) {
  return (
    <div className="glass-card p-6 fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Settings2 className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">Bộ lọc</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <Label htmlFor="minPriceDrop" className="text-muted-foreground">
            Giảm giá 24h tối thiểu (%)
          </Label>
          <Input
            id="minPriceDrop"
            type="number"
            value={settings.minPriceDropPercent}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                minPriceDropPercent: parseFloat(e.target.value) || 0,
              })
            }
            className="font-mono bg-secondary border-border focus:border-primary"
            min={0}
            step={0.5}
          />
        </div>
      </div>
    </div>
  );
}
