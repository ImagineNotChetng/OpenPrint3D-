import { getPrinters, getPrinterById } from "@/lib/profiles";
import { Badge } from "@/components/badge";
import { JsonViewer } from "@/components/json-viewer";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return getPrinters().map((p) => ({ id: p.id }));
}

export default async function PrinterDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const printer = getPrinterById(decodeURIComponent(id));
  if (!printer) notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/printers" className="text-sm text-muted hover:text-accent transition-colors mb-6 inline-flex items-center gap-1">
        ← Back to Printers
      </Link>

      <div className="mt-6 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="accent">{printer.kinematics}</Badge>
            {printer.variant && <span className="text-sm text-muted">{printer.variant}</span>}
            {printer.license && <Badge variant="success">License: {printer.license}</Badge>}
            {printer.profile_version && <Badge>v{printer.profile_version}</Badge>}
          </div>
          <h1 className="text-3xl font-bold mb-1">{printer.model}</h1>
          <p className="text-muted">{printer.manufacturer}</p>
        </div>

        {/* Personal Preferences (Discussion #44) */}
        {printer.personal_preferences && Object.keys(printer.personal_preferences).length > 0 && (
          <div className="p-5 rounded-2xl bg-warning/10 border border-warning/30">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <span>👤</span> Personal Preferences
            </h3>
            <p className="text-xs text-muted mb-3">User-specific overrides for this printer</p>
            <div className="text-xs font-mono bg-background p-3 rounded-lg overflow-auto">
              {JSON.stringify(printer.personal_preferences, null, 2)}
            </div>
          </div>
        )}

        {/* Build Volume */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h3 className="font-semibold mb-4">Build Volume</h3>
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32 border-2 border-accent/30 rounded-lg flex items-center justify-center bg-accent/5">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{printer.build_volume.x}</div>
                <div className="text-xs text-muted">× {printer.build_volume.y} × {printer.build_volume.z}</div>
                <div className="text-xs text-muted mt-1">mm</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex gap-6"><span className="text-muted w-16">X</span><span className="font-mono">{printer.build_volume.x} mm</span></div>
              <div className="flex gap-6"><span className="text-muted w-16">Y</span><span className="font-mono">{printer.build_volume.y} mm</span></div>
              <div className="flex gap-6"><span className="text-muted w-16">Z</span><span className="font-mono">{printer.build_volume.z} mm</span></div>
              {printer.build_volume.shape && <div className="flex gap-6"><span className="text-muted w-16">Shape</span><span>{printer.build_volume.shape}</span></div>}
              {printer.build_volume.origin && <div className="flex gap-6"><span className="text-muted w-16">Origin</span><span>{printer.build_volume.origin}</span></div>}
            </div>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Axes */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <h3 className="font-semibold text-sm">Axes</h3>
            {(["x", "y", "z"] as const).map((axis) => (
              <div key={axis} className="text-sm">
                <span className="font-mono text-accent uppercase mr-3">{axis}</span>
                <span className="text-muted">Speed: </span><span className="font-mono">{printer.axes[axis].max_speed} mm/s</span>
                <span className="text-muted ml-3">Accel: </span><span className="font-mono">{printer.axes[axis].max_accel} mm/s²</span>
              </div>
            ))}
          </div>

          {/* Extruders */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <h3 className="font-semibold text-sm">Extruder</h3>
            {printer.extruders && printer.extruders.length > 0 ? printer.extruders.map((ext) => (
              <div key={ext.id} className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted">Nozzle</span><span className="font-mono">{ext.nozzle_diameter}mm {ext.nozzle_material ?? ""}</span></div>
                {ext.max_temp && <div className="flex justify-between"><span className="text-muted">Max Temp</span><span className="font-mono">{ext.max_temp}°C</span></div>}
                {ext.min_temp && <div className="flex justify-between"><span className="text-muted">Min Temp</span><span className="font-mono">{ext.min_temp}°C</span></div>}
              </div>
            )) : <div className="text-sm text-muted">No extruder data available</div>}
          </div>

          {/* Bed */}
          {printer.bed && (
            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
              <h3 className="font-semibold text-sm">Bed</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted">Heated</span><span>{printer.bed.heated ? "✓ Yes" : "✗ No"}</span></div>
                {printer.bed.max_temp && <div className="flex justify-between"><span className="text-muted">Max Temp</span><span className="font-mono">{printer.bed.max_temp}°C</span></div>}
                {printer.bed.surface_type && <div className="flex justify-between"><span className="text-muted">Surface</span><span>{printer.bed.surface_type}</span></div>}
              </div>
            </div>
          )}

          {/* Firmware & Network */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <h3 className="font-semibold text-sm">Firmware & Network</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted">Firmware</span><span className="font-mono">{printer.firmware.flavor}</span></div>
              {printer.firmware.identifier && <div className="flex justify-between"><span className="text-muted">Version</span><span className="text-xs">{printer.firmware.identifier}</span></div>}
              {printer.network && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {printer.network.has_wifi && <Badge variant="success">Wi-Fi</Badge>}
                  {printer.network.has_ethernet && <Badge variant="success">Ethernet</Badge>}
                  {printer.network.supports_lan_api && <Badge variant="accent">LAN API</Badge>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        {printer.tags && printer.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {printer.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
          </div>
        )}

        {/* Notes */}
        {printer.notes && (
          <div className="p-5 rounded-2xl bg-card border border-border">
            <h3 className="font-semibold text-sm mb-2">Notes</h3>
            <p className="text-sm text-muted leading-relaxed">{printer.notes}</p>
          </div>
        )}

        <JsonViewer data={printer} />
      </div>
    </div>
  );
}
