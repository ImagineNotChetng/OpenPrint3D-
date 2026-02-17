"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const toolsData = [
  {
    category: "Calibration Wizards",
    icon: "⚙️",
    tools: [
      { slug: "input_shaping_wizard", name: "Input Shaping Wizard", desc: "Interactive guide to configure input shaping" },
      { slug: "first_layer_calibration", name: "First Layer Calibration", desc: "Step-by-step first layer calibration" },
      { slug: "extruder_calibration", name: "Extruder Calibration", desc: "Complete extruder calibration guide" },
      { slug: "flow_rate_calibration", name: "Flow Rate Calibration", desc: "Flow rate testing and optimization" },
      { slug: "pressure_advance_tuner", name: "Pressure Advance Tuner", desc: "Tune pressure advance settings" },
    ]
  },
  {
    category: "Calculators",
    icon: "🔢",
    tools: [
      { slug: "retraction_calculator", name: "Retraction Calculator", desc: "Calculate optimal retraction settings" },
      { slug: "volumetric_flow_calculator", name: "Volumetric Flow Calculator", desc: "Calculate max volumetric flow" },
      { slug: "layer_height_optimizer", name: "Layer Height Optimizer", desc: "Optimize layer height for your printer" },
      { slug: "material_blend_calculator", name: "Material Blend Calculator", desc: "Blend materials for custom profiles" },
      { slug: "print_cost_calculator", name: "Print Cost Calculator", desc: "Calculate print costs" },
      { slug: "infill_optimizer", name: "Infill Optimizer", desc: "Optimize infill patterns and percentages" },
      { slug: "support_optimizer", name: "Support Optimizer", desc: "Optimize support settings" },
    ]
  },
  {
    category: "Profile Tools",
    icon: "📄",
    tools: [
      { slug: "list_profiles", name: "List Profiles", desc: "List all available profiles" },
      { slug: "batch_validate", name: "Batch Validate", desc: "Validate multiple JSON profiles" },
      { slug: "convert_profile", name: "Convert Profile", desc: "Convert between profile formats" },
      { slug: "compare_profiles", name: "Compare Profiles", desc: "Compare two profiles" },
      { slug: "import_prusaslicer", name: "Import PrusaSlicer", desc: "Import from PrusaSlicer format" },
      { slug: "slicer_translator", name: "Slicer Translator", desc: "Translate between slicer formats" },
      { slug: "format_convert", name: "Format Convert", desc: "Convert JSON to YAML and vice versa" },
    ]
  },
  {
    category: "Test Generators",
    icon: "🧪",
    tools: [
      { slug: "temp_tower", name: "Temp Tower", desc: "Generate temperature tower" },
      { slug: "resonant_frequency_test", name: "Resonant Frequency Test", desc: "Test for resonant frequencies" },
      { slug: "analyze_gcode", name: "Analyze GCode", desc: "Analyze printed GCode" },
    ]
  },
  {
    category: "Other",
    icon: "🔧",
    tools: [
      { slug: "validate_schema", name: "Validate Schema", desc: "Validate JSON schema" },
    ]
  },
];

export default function ToolsViewerPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTools = toolsData.map(cat => ({
    ...cat,
    tools: cat.tools.filter(t => 
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.tools.length > 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
              <span>🐍</span> Python Tools
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Calibration <span className="text-purple-400">Tools</span>
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
              Interactive Python scripts for calibration, testing, and profile management. 
              Download and run locally.
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search tools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-xl border border-border bg-card text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <svg 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === null 
                  ? "bg-purple-500 text-white" 
                  : "bg-card border border-border text-muted hover:border-purple-500/50"
              }`}
            >
              All Tools
            </button>
            {toolsData.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.category 
                    ? "bg-purple-500 text-white" 
                    : "bg-card border border-border text-muted hover:border-purple-500/50"
                }`}
              >
                {cat.icon} {cat.category}
              </button>
            ))}
          </div>

          {/* Tools by Category */}
          <div className="grid gap-8">
            {(selectedCategory ? filteredTools.filter(c => c.category === selectedCategory) : filteredTools).map((category) => (
              <div key={category.category} className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span> {category.category}
                  <span className="text-sm font-normal text-muted">({category.tools.length} tools)</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.tools.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/tools-viewer/${tool.slug}`}
                      className="p-5 rounded-xl border border-border hover:border-purple-500 hover:bg-purple-500/5 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold group-hover:text-purple-400 transition-colors">
                          {tool.name}
                        </h3>
                        <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded">
                          .py
                        </span>
                      </div>
                      <p className="text-sm text-muted">{tool.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-4">
            {toolsData.map((cat) => (
              <div key={cat.category} className="glass-card p-4 rounded-xl border border-border text-center">
                <div className="text-2xl mb-2">{cat.icon}</div>
                <div className="font-semibold text-purple-400">{cat.tools.length}</div>
                <div className="text-sm text-muted">{cat.category}</div>
              </div>
            ))}
          </div>

          {/* How to Use */}
          <div className="mt-12 bg-gradient-to-br from-purple-500/10 to-accent/10 rounded-2xl p-8 border border-purple-500/20">
            <h2 className="text-2xl font-bold mb-4 text-center">🐍 How to Use Python Tools</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl font-bold">1</div>
                <h3 className="font-semibold mb-2">Install Python</h3>
                <p className="text-sm text-muted">Install Python 3.8 or higher from python.org</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl font-bold">2</div>
                <h3 className="font-semibold mb-2">Clone Repository</h3>
                <p className="text-sm text-muted">Clone OpenPrint3D from GitHub</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl font-bold">3</div>
                <h3 className="font-semibold mb-2">Run Tools</h3>
                <p className="text-sm text-muted">Use: python tools/tool_name.py</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
