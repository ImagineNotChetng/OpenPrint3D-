"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

// Stats - in production these could come from a config/API
const stats = {
  totalTools: 21,
  totalGuides: 26,
};

const categoryIcons: Record<string, string> = {
  "Calibration Wizards": "⚙️",
  "Calculators": "🔢",
  "Profile Tools": "📄",
  "Test Generators": "🧪",
  "Calibration Guides": "📊",
  "Print Quality": "✨",
  "Materials": "🧵",
  "Hardware": "🔧",
};

export default function ToolsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "tools" | "guides">("all");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <main className="flex-1">
        {/* Hero with gradient background */}
        <div className="relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
          
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          
          <div className="relative max-w-7xl mx-auto px-6 py-20">
            {/* Hero Content */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
                <span>🛠️</span> OpenPrint3D Toolkit
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-foreground via-foreground to-accent bg-clip-text text-transparent">
                  Calibration
                </span>{" "}
                <span className="text-accent">Tools</span>
              </h1>
              
              <p className="text-xl text-muted max-w-3xl mx-auto mb-8 leading-relaxed">
                Master your 3D printer with our comprehensive suite of calibration tools, 
                calculators, and expert guides. From first-layer calibration to advanced 
                pressure advance tuning.
              </p>

              {/* Stats */}
              <div className="flex justify-center gap-8 mb-10">
                <div className="glass-card px-8 py-4 rounded-2xl border border-accent/20">
                  <div className="text-3xl font-bold text-accent">{stats.totalTools}</div>
                  <div className="text-sm text-muted">Python Tools</div>
                </div>
                <div className="glass-card px-8 py-4 rounded-2xl border border-accent/20">
                  <div className="text-3xl font-bold text-accent">{stats.totalGuides}</div>
                  <div className="text-sm text-muted">Guides</div>
                </div>
              </div>

              {/* Search */}
              <div className="relative max-w-xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-2xl blur-xl" />
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search tools, guides, calculators..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-6 py-4 pl-14 rounded-2xl border border-border bg-card/80 backdrop-blur-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all shadow-lg"
                  />
                  <svg 
                    className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 pb-20 -mt-8 relative z-10">
          
          {/* Two Main Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Calibration & Guides Card */}
            <a 
              href="/guides"
              className="group relative overflow-hidden rounded-3xl border border-border bg-card transition-all duration-500 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-2"
            >
              {/* Card Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-3xl border border-accent/20 group-hover:scale-110 transition-transform duration-300">
                    📖
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                    {stats.totalGuides} Guides
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors">
                  Calibration & Guides
                </h2>
                <p className="text-muted mb-6">
                  Comprehensive documentation covering bed leveling, PID tuning, input shaping, 
                  print quality troubleshooting, and material-specific guides.
                </p>
                
                <div className="flex items-center gap-2 text-accent font-medium group-hover:gap-4 transition-all">
                  <span>Browse all guides</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {["Calibration", "Print Quality", "Materials", "Hardware"].map((cat) => (
                    <span key={cat} className="px-3 py-1 text-xs rounded-full bg-muted/50 text-muted">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </a>

            {/* Python Tools Card */}
            <a 
              href="/tools-viewer"
              className="group relative overflow-hidden rounded-3xl border border-border bg-card transition-all duration-500 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-2"
            >
              {/* Card Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center text-3xl border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                    🐍
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {stats.totalTools} Tools
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold mb-3 group-hover:text-purple-400 transition-colors">
                  Python Tools
                </h2>
                <p className="text-muted mb-6">
                  Interactive calibration wizards, calculators, and profile management tools. 
                  Run locally for full control over your printer settings.
                </p>
                
                <div className="flex items-center gap-2 text-purple-400 font-medium group-hover:gap-4 transition-all">
                  <span>View all tools</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {["Wizards", "Calculators", "Profiles", "Tests"].map((cat) => (
                    <span key={cat} className="px-3 py-1 text-xs rounded-full bg-muted/50 text-muted">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          </div>

          {/* Filter Tabs */}
          {search && (
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-card border border-border">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "all" 
                      ? "bg-accent text-white shadow-lg shadow-accent/25" 
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab("tools")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "tools" 
                      ? "bg-accent text-white shadow-lg shadow-accent/25" 
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Tools Only
                </button>
                <button
                  onClick={() => setActiveTab("guides")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "guides" 
                      ? "bg-accent text-white shadow-lg shadow-accent/25" 
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Guides Only
                </button>
              </div>
            </div>
          )}

          {/* Quick Links Section - Categories with Icons */}
          {(activeTab === "all" || activeTab === "guides") && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-accent to-purple-500 rounded-full" />
                <h2 className="text-2xl font-bold">Guide Categories</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Calibration Guides", icon: "📊", count: 8 },
                  { name: "Print Quality", icon: "✨", count: 6 },
                  { name: "Materials", icon: "🧵", count: 5 },
                  { name: "Hardware", icon: "🔧", count: 1 },
                ].map((category) => (
                  <a
                    key={category.name}
                    href="/guides"
                    className="group relative p-6 rounded-2xl border border-border bg-card hover:border-accent/50 hover:bg-accent/5 transition-all duration-300"
                  >
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-accent transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted">{category.count} guides</p>
                  </a>
                ))}
              </div>
            </section>
          )}

          {(activeTab === "all" || activeTab === "tools") && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-accent rounded-full" />
                <h2 className="text-2xl font-bold">Tool Categories</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Calibration Wizards", icon: "⚙️", count: 5 },
                  { name: "Calculators", icon: "🔢", count: 7 },
                  { name: "Profile Tools", icon: "📄", count: 7 },
                  { name: "Test Generators", icon: "🧪", count: 3 },
                ].map((category) => (
                  <a
                    key={category.name}
                    href="/tools-viewer"
                    className="group relative p-6 rounded-2xl border border-border bg-card hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300"
                  >
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-purple-400 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted">{category.count} tools</p>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* How to Use Section */}
          <section className="mt-16 relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-purple-500/10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
            
            <div className="relative p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-8 text-center">
                🚀 <span className="text-accent">Get Started</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Python Tools Instructions */}
                <div className="glass-card p-6 rounded-2xl border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center text-xl">
                      🐍
                    </div>
                    <h3 className="text-xl font-semibold">Using Python Tools</h3>
                  </div>
                  <ol className="list-decimal list-inside text-muted space-y-3">
                    <li>Install Python 3.8 or higher</li>
                    <li>Clone the <code className="text-accent">OpenPrint3D</code> repository</li>
                    <li>Navigate to the <code className="text-accent">tools/</code> directory</li>
                    <li>Run any script: <code className="bg-muted/50 px-2 py-1 rounded text-sm">python tool_name.py</code></li>
                  </ol>
                  <a 
                    href="/tools-viewer" 
                    className="inline-flex items-center gap-2 mt-4 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    View all tools
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                {/* Guides Instructions */}
                <div className="glass-card p-6 rounded-2xl border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-xl">
                      📖
                    </div>
                    <h3 className="text-xl font-semibold">Reading Guides</h3>
                  </div>
                  <ol className="list-decimal list-inside text-muted space-y-3">
                    <li>Browse guides by category above</li>
                    <li>Click any guide to view the content</li>
                    <li>Guides render as formatted Markdown</li>
                    <li>Use our <code className="text-accent">/guides</code> page for full navigation</li>
                  </ol>
                  <a 
                    href="/guides" 
                    className="inline-flex items-center gap-2 mt-4 text-accent hover:text-accent/80 transition-colors"
                  >
                    Browse all guides
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
