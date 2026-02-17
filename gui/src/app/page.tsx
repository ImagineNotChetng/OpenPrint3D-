import Link from "next/link";
import { getFilaments, getPrinters, getProcesses } from "@/lib/profiles";

export default function Home() {
  const filaments = getFilaments();
  const printers = getPrinters();
  const processes = getProcesses();

  const stats = [
    { label: "Filaments", count: filaments.length, href: "/filaments", icon: "🧵", desc: "Material profiles" },
    { label: "Printers", count: printers.length, href: "/printers", icon: "🖨️", desc: "Printer profiles" },
    { label: "Processes", count: processes.length, href: "/processes", icon: "⚙️", desc: "Process presets" },
  ];

  return (
    <div className="bg-grid min-h-screen">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-muted border border-accent/20 text-accent text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Schema v0.1.0 — Early Draft
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            The Open Standard for{" "}
            <span className="text-accent">3D Printing</span>{" "}
            Profiles
          </h1>
          <p className="text-lg text-muted leading-relaxed mb-8 max-w-2xl">
            A slicer-independent, vendor-neutral JSON format for describing printers, filaments, and processes.
            Share configurations across tools without fragmentation.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/filaments"
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-xl transition-colors"
            >
              Browse Profiles
            </Link>
            <Link
              href="/create"
              className="px-5 py-2.5 bg-card hover:bg-card-hover border border-border text-sm font-medium rounded-xl transition-colors"
            >
              Create Profile
            </Link>
            <a
              href="https://github.com/OpenPrint3D/OpenPrint3D"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-card hover:bg-card-hover border border-border text-sm font-medium rounded-xl transition-colors"
            >
              View on GitHub →
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-border-hover glow-hover transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{stat.icon}</span>
                <span className="text-3xl font-bold text-accent">{stat.count}</span>
              </div>
              <h3 className="text-lg font-semibold mb-1 group-hover:text-accent transition-colors">{stat.label}</h3>
              <p className="text-sm text-muted">{stat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Printer", desc: "Define your machine — build volume, kinematics, extruder specs, firmware flavor." },
            { step: "02", title: "Filament", desc: "Describe the material — temperatures, fan settings, drying requirements, environmental needs." },
            { step: "03", title: "Process", desc: "Set the intent — layer height, speeds, infill, supports, quality bias." },
          ].map((item) => (
            <div key={item.step} className="p-6 rounded-2xl bg-card border border-border">
              <span className="text-xs font-mono text-accent mb-3 block">{item.step}</span>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Profiles Preview */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Recent Filament Profiles</h2>
          <Link href="/filaments" className="text-sm text-accent hover:text-accent-hover transition-colors">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filaments.slice(0, 8).map((f) => (
            <Link
              key={f.id}
              href={`/filaments/${encodeURIComponent(f.id)}`}
              className="group p-4 rounded-xl bg-card border border-border hover:border-border-hover glow-hover transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono px-2 py-0.5 bg-accent-muted text-accent rounded-md">{f.material}</span>
              </div>
              <h4 className="font-medium text-sm group-hover:text-accent transition-colors truncate">{f.name}</h4>
              <p className="text-xs text-muted mt-1">{f.brand}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted">
                <span>🌡️ {f.nozzle.recommended ?? f.nozzle.min}–{f.nozzle.max}°C</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
