import Link from "next/link";
import { getFilaments, getPrinters, getProcesses } from "@/lib/profiles";
import { FilamentCard, PrinterCard, ProcessCard } from "@/components/profile-card";

export default function Home() {
  const filaments = getFilaments();
  const printers = getPrinters();
  const processes = getProcesses();

  const stats = [
    { label: "Filaments", count: filaments.length, href: "/filaments", icon: "🧵", desc: "Material profiles", color: "from-blue-500 to-blue-600" },
    { label: "Printers", count: printers.length, href: "/printers", icon: "🖨️", desc: "Printer profiles", color: "from-purple-500 to-purple-600" },
    { label: "Processes", count: processes.length, href: "/processes", icon: "⚙️", desc: "Process presets", color: "from-green-500 to-green-600" },
  ];

  const steps = [
    { step: "01", title: "Printer", desc: "Define your machine — build volume, kinematics, extruder specs, firmware flavor.", icon: "🖨️" },
    { step: "02", title: "Filament", desc: "Describe the material — temperatures, fan settings, drying requirements, environmental needs.", icon: "🧵" },
    { step: "03", title: "Process", desc: "Set the intent — layer height, speeds, infill, supports, quality bias.", icon: "⚙️" },
  ];

  return (
    <div className="bg-grid min-h-screen">
      <section className="hero-gradient max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-muted border border-accent/20 text-accent text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Schema v0.1.0 — Early Draft
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            The Open Standard for{" "}
            <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">3D Printing</span>{" "}
            Profiles
          </h1>
          <p className="text-lg text-muted leading-relaxed mb-8 max-w-2xl">
            A slicer-independent, vendor-neutral JSON format for describing printers, filaments, and processes.
            Share configurations across tools without fragmentation.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/filaments" className="btn-primary">
              Browse Profiles
            </Link>
            <Link href="/create" className="btn-secondary">
              Create Profile
            </Link>
            <a
              href="https://github.com/OpenPrint3D/OpenPrint3D"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View on GitHub →
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="stat-card group animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {stat.icon}
                </div>
                <span className="text-4xl font-bold bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
                  {stat.count}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-1 group-hover:text-accent transition-colors">{stat.label}</h3>
              <p className="text-sm text-muted">{stat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Three components make up a complete print profile</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item, i) => (
            <div
              key={item.step}
              className="p-6 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-mono px-2 py-1 bg-accent-muted text-accent rounded-md">{item.step}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Recent Filament Profiles</h2>
            <p className="section-subtitle">Browse the latest material configurations</p>
          </div>
          <Link href="/filaments" className="text-sm text-accent hover:text-accent-hover transition-colors flex items-center gap-1">
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filaments.slice(0, 8).map((f, i) => (
            <div key={f.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <FilamentCard filament={f} />
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Printer Profiles</h2>
            <p className="section-subtitle">Configure your 3D printer hardware</p>
          </div>
          <Link href="/printers" className="text-sm text-accent hover:text-accent-hover transition-colors flex items-center gap-1">
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {printers.slice(0, 6).map((p, i) => (
            <div key={p.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <PrinterCard printer={p} />
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Process Presets</h2>
            <p className="section-subtitle">Slice profiles for different print intents</p>
          </div>
          <Link href="/processes" className="text-sm text-accent hover:text-accent-hover transition-colors flex items-center gap-1">
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {processes.slice(0, 6).map((p, i) => (
            <div key={p.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <ProcessCard process={p} />
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="p-8 rounded-2xl bg-gradient-to-r from-accent-muted to-card border border-accent/20 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to contribute?</h2>
          <p className="text-muted mb-6 max-w-xl mx-auto">
            Help build the open standard for 3D printing profiles. Add your printer, filament, or process configurations.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://github.com/OpenPrint3D/OpenPrint3D"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Contribute on GitHub
            </a>
            <Link href="/create" className="btn-secondary">
              Create Profile
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}