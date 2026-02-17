import { getFilaments, getFilamentById } from "@/lib/profiles";
import { Badge } from "@/components/badge";
import { TemperatureGauge } from "@/components/temperature-gauge";
import { JsonViewer } from "@/components/json-viewer";
import { ColorVariants } from "@/components/color-variants";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return getFilaments().map((f) => ({ id: f.id }));
}

export default async function FilamentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const filament = getFilamentById(decodeURIComponent(id));
  if (!filament) notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/filaments" className="text-sm text-muted hover:text-accent transition-colors mb-6 inline-flex items-center gap-1">
        ← Back to Filaments
      </Link>

      <div className="mt-6 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="accent">{filament.material}</Badge>
            {filament.diameter && <span className="text-sm text-muted">{filament.diameter}mm</span>}
            {filament.license && <Badge variant="success">License: {filament.license}</Badge>}
            {filament.profile_version && <Badge>v{filament.profile_version}</Badge>}
          </div>
          <h1 className="text-3xl font-bold mb-1">{filament.name}</h1>
          <p className="text-muted">{filament.brand}</p>
        </div>

        {/* Color Variants (Issue #38) */}
        {filament.color_variants && filament.color_variants.length > 0 && (
          <ColorVariants variants={filament.color_variants} />
        )}

        {/* Single Color */}
        {filament.color && !filament.color_variants && (
          <div className="p-5 rounded-2xl bg-card border border-border">
            <h3 className="font-semibold text-sm mb-3">Color</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border border-border" style={{ backgroundColor: filament.color.startsWith('#') ? filament.color : `#${filament.color}` }} />
              <span className="text-sm font-mono">{filament.color}</span>
            </div>
          </div>
        )}

        {/* Temperature Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-card border border-border">
            <TemperatureGauge min={filament.nozzle.min} max={filament.nozzle.max} recommended={filament.nozzle.recommended} label="Nozzle Temperature" />
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border">
            <TemperatureGauge min={filament.bed.min} max={filament.bed.max} recommended={filament.bed.recommended} label="Bed Temperature" />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fan */}
          {filament.fan && (
            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
              <h3 className="font-semibold text-sm">Fan Cooling</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted">Min</span><span className="font-mono">{filament.fan.min ?? 0}%</span></div>
                <div className="flex justify-between"><span className="text-muted">Max</span><span className="font-mono">{filament.fan.max ?? 100}%</span></div>
                {filament.fan.recommended !== undefined && <div className="flex justify-between"><span className="text-muted">Recommended</span><span className="font-mono text-accent">{filament.fan.recommended}%</span></div>}
              </div>
            </div>
          )}

          {/* Properties */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <h3 className="font-semibold text-sm">Properties</h3>
            <div className="space-y-2 text-sm">
              {filament.density && <div className="flex justify-between"><span className="text-muted">Density</span><span className="font-mono">{filament.density} g/cm³</span></div>}
              {filament.volumetric_speed && <div className="flex justify-between"><span className="text-muted">Max Volumetric Speed</span><span className="font-mono">{filament.volumetric_speed} mm³/s</span></div>}
            </div>
          </div>

          {/* Printing Speed (Issue #37) */}
          {filament.printing_speed && (
            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
              <h3 className="font-semibold text-sm">Printing Speed</h3>
              <div className="space-y-2 text-sm">
                {filament.printing_speed.min !== undefined && <div className="flex justify-between"><span className="text-muted">Min</span><span className="font-mono">{filament.printing_speed.min} mm/s</span></div>}
                {filament.printing_speed.max !== undefined && <div className="flex justify-between"><span className="text-muted">Max</span><span className="font-mono">{filament.printing_speed.max} mm/s</span></div>}
                {filament.printing_speed.recommended !== undefined && <div className="flex justify-between"><span className="text-muted">Recommended</span><span className="font-mono text-accent">{filament.printing_speed.recommended} mm/s</span></div>}
              </div>
            </div>
          )}

          {/* Drying */}
          {filament.drying && (
            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
              <h3 className="font-semibold text-sm">Drying</h3>
              <div className="space-y-2 text-sm">
                {filament.drying.temperature && <div className="flex justify-between"><span className="text-muted">Temperature</span><span className="font-mono">{filament.drying.temperature}°C</span></div>}
                {filament.drying.duration_hours && <div className="flex justify-between"><span className="text-muted">Duration</span><span className="font-mono">{filament.drying.duration_hours}h</span></div>}
              </div>
            </div>
          )}

          {/* Environment */}
          {filament.environment && (
            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
              <h3 className="font-semibold text-sm">Environment</h3>
              <div className="flex flex-wrap gap-2">
                {filament.environment.sensitive_to_moisture && <Badge variant="warning">Moisture Sensitive</Badge>}
                {filament.environment.enclosure_recommended && <Badge variant="danger">Enclosure Recommended</Badge>}
                {!filament.environment.enclosure_recommended && <Badge variant="success">Open Frame OK</Badge>}
                {filament.environment.max_ambient_temp && <Badge>Max Ambient: {filament.environment.max_ambient_temp}°C</Badge>}
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {filament.tags && filament.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filament.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}

        {/* Notes */}
        {filament.notes && (
          <div className="p-5 rounded-2xl bg-card border border-border">
            <h3 className="font-semibold text-sm mb-2">Notes</h3>
            <p className="text-sm text-muted leading-relaxed">{filament.notes}</p>
          </div>
        )}

        {/* Raw JSON */}
        <JsonViewer data={filament} />
      </div>
    </div>
  );
}
