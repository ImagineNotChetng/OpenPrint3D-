import { getProcesses, getProcessById } from "@/lib/profiles";
import { Badge } from "@/components/badge";
import { JsonViewer } from "@/components/json-viewer";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return getProcesses().map((p) => ({ id: p.id }));
}

export default async function ProcessDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const process = getProcessById(decodeURIComponent(id));
  if (!process) notFound();

  const intentColors: Record<string, "accent" | "success" | "warning" | "danger" | "default"> = {
    high_detail: "accent", quality: "success", standard: "default", draft: "warning", mechanical: "danger",
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/processes" className="text-sm text-muted hover:text-accent transition-colors mb-6 inline-flex items-center gap-1">
        ← Back to Processes
      </Link>

      <div className="mt-6 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Badge variant={intentColors[process.intent] ?? "default"}>{process.intent.replace("_", " ")}</Badge>
            {process.quality_bias?.priority && <Badge>{process.quality_bias.priority} priority</Badge>}
            {process.license && <Badge variant="success">License: {process.license}</Badge>}
            {process.profile_version && <Badge>v{process.profile_version}</Badge>}
          </div>
          <h1 className="text-3xl font-bold mb-1">{process.name}</h1>
        </div>

        {/* Relative Overrides (Discussion #42) */}
        {process.relative_overrides && Object.keys(process.relative_overrides).length > 0 && (
          <div className="p-5 rounded-2xl bg-accent/10 border border-accent/30">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <span>🔗</span> Relative Overrides
            </h3>
            <p className="text-xs text-muted mb-3">Chain overrides for this process</p>
            <div className="text-xs font-mono bg-background p-3 rounded-lg overflow-auto">
              {JSON.stringify(process.relative_overrides, null, 2)}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Layer Height */}
          {process.layer_height && (
            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
              <h3 className="font-semibold text-sm">Layer Height</h3>
              <div className="text-3xl font-bold text-accent">{process.layer_height.default}mm</div>
              <div className="text-xs text-muted">Range: {process.layer_height.min}mm – {process.layer_height.max}mm</div>
            </div>
          )}

          {/* Walls */}
          {process.wall_settings && (
            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
              <h3 className="font-semibold text-sm">Wall Settings</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted">Walls</span><span className="font-mono">{process.wall_settings.wall_count}</span></div>
                <div className="flex justify-between"><span className="text-muted">Top Layers</span><span className="font-mono">{process.wall_settings.top_layers}</span></div>
                <div className="flex justify-between"><span className="text-muted">Bottom Layers</span><span className="font-mono">{process.wall_settings.bottom_layers}</span></div>
              </div>
            </div>
          )}

          {/* Speed */}
          {process.speed && (
            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
              <h3 className="font-semibold text-sm">Speed</h3>
              <div className="space-y-1.5 text-sm">
                {process.speed.outer_wall && <div className="flex justify-between"><span className="text-muted">Outer Wall</span><span className="font-mono">{process.speed.outer_wall} mm/s</span></div>}
                {process.speed.inner_wall && <div className="flex justify-between"><span className="text-muted">Inner Wall</span><span className="font-mono">{process.speed.inner_wall} mm/s</span></div>}
                {process.speed.infill && <div className="flex justify-between"><span className="text-muted">Infill</span><span className="font-mono">{process.speed.infill} mm/s</span></div>}
                {process.speed.top_bottom && <div className="flex justify-between"><span className="text-muted">Top/Bottom</span><span className="font-mono">{process.speed.top_bottom} mm/s</span></div>}
                {process.speed.travel && <div className="flex justify-between"><span className="text-muted">Travel</span><span className="font-mono">{process.speed.travel} mm/s</span></div>}
              </div>
            </div>
          )}

          {/* Infill */}
          {process.infill && (
            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
              <h3 className="font-semibold text-sm">Infill</h3>
              <div className="text-2xl font-bold text-accent">{process.infill.density_default}%</div>
              {process.infill.density_range && <div className="text-xs text-muted">Range: {process.infill.density_range.min}% – {process.infill.density_range.max}%</div>}
              {process.infill.recommended_patterns && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {process.infill.recommended_patterns.map((p) => <Badge key={p}>{p}</Badge>)}
                </div>
              )}
            </div>
          )}

          {/* Retraction */}
          {process.retraction && (
            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
              <h3 className="font-semibold text-sm">Retraction</h3>
              <div className="space-y-1.5 text-sm">
                {process.retraction.distance && <div className="flex justify-between"><span className="text-muted">Distance</span><span className="font-mono">{process.retraction.distance}mm</span></div>}
                {process.retraction.speed && <div className="flex justify-between"><span className="text-muted">Speed</span><span className="font-mono">{process.retraction.speed} mm/s</span></div>}
              </div>
            </div>
          )}

          {/* Supports & Adhesion */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <h3 className="font-semibold text-sm">Supports & Adhesion</h3>
            <div className="space-y-1.5 text-sm">
              {process.supports && <div className="flex justify-between"><span className="text-muted">Supports Default</span><span>{process.supports.enabled_default ? "On" : "Off"}</span></div>}
              {process.supports?.overhang_threshold && <div className="flex justify-between"><span className="text-muted">Overhang Threshold</span><span className="font-mono">{process.supports.overhang_threshold}°</span></div>}
              {process.adhesion?.default_type && <div className="flex justify-between"><span className="text-muted">Adhesion</span><span>{process.adhesion.default_type}</span></div>}
            </div>
          </div>
        </div>

        {process.tags && process.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {process.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
          </div>
        )}

        {process.notes && (
          <div className="p-5 rounded-2xl bg-card border border-border">
            <h3 className="font-semibold text-sm mb-2">Notes</h3>
            <p className="text-sm text-muted leading-relaxed">{process.notes}</p>
          </div>
        )}

        <JsonViewer data={process} />
      </div>
    </div>
  );
}
