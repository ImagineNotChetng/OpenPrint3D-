export function TemperatureGauge({ min, max, recommended, label }: { min: number; max: number; recommended?: number; label: string }) {
  const range = max - min;
  const recPos = recommended ? ((recommended - min) / range) * 100 : 50;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {recommended && (
          <span className="text-sm text-accent font-mono">{recommended}°C</span>
        )}
      </div>
      <div className="relative h-3 rounded-full overflow-hidden bg-card border border-border">
        <div className="absolute inset-0 temp-gradient opacity-60 rounded-full" />
        {recommended && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]"
            style={{ left: `${recPos}%` }}
          />
        )}
      </div>
      <div className="flex justify-between text-xs text-muted">
        <span>{min}°C</span>
        <span>{max}°C</span>
      </div>
    </div>
  );
}
