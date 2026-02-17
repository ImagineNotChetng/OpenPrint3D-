"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const toolsData = [
  {
    category: "Calibration Wizards",
    icon: "⚙️",
    tools: [
      { name: "Input Shaping Wizard", file: "input_shaping_wizard.py", desc: "Interactive guide to configure input shaping" },
      { name: "First Layer Calibration", file: "first_layer_calibration.py", desc: "Step-by-step first layer calibration" },
      { name: "Extruder Calibration", file: "extruder_calibration.py", desc: "Complete extruder calibration guide" },
      { name: "Flow Rate Calibration", file: "flow_rate_calibration.py", desc: "Flow rate testing and optimization" },
      { name: "Pressure Advance Tuner", file: "pressure_advance_tuner.py", desc: "Tune pressure advance settings" },
    ]
  },
  {
    category: "Calculators",
    icon: "🔢",
    tools: [
      { name: "Retraction Calculator", file: "retraction_calculator.py", desc: "Calculate optimal retraction settings" },
      { name: "Volumetric Flow Calculator", file: "volumetric_flow_calculator.py", desc: "Calculate max volumetric flow" },
      { name: "Layer Height Optimizer", file: "layer_height_optimizer.py", desc: "Optimize layer height for your printer" },
      { name: "Material Blend Calculator", file: "material_blend_calculator.py", desc: "Blend materials for custom profiles" },
      { name: "Print Cost Calculator", file: "print_cost_calculator.py", desc: "Calculate print costs" },
      { name: "Infill Optimizer", file: "infill_optimizer.py", desc: "Optimize infill patterns and percentages" },
      { name: "Support Optimizer", file: "support_optimizer.py", desc: "Optimize support settings" },
    ]
  },
  {
    category: "Profile Tools",
    icon: "📄",
    tools: [
      { name: "List Profiles", file: "list_profiles.py", desc: "List all available profiles" },
      { name: "Batch Validate", file: "batch_validate.py", desc: "Validate multiple JSON profiles" },
      { name: "Convert Profile", file: "convert_profile.py", desc: "Convert between profile formats" },
      { name: "Compare Profiles", file: "compare_profiles.py", desc: "Compare two profiles" },
      { name: "Import PrusaSlicer", file: "import_prusaslicer.py", desc: "Import from PrusaSlicer format" },
      { name: "Slicer Translator", file: "slicer_translator.py", desc: "Translate between slicer formats" },
      { name: "Format Convert", file: "format_convert.py", desc: "Convert JSON to YAML and vice versa" },
    ]
  },
  {
    category: "Test Generators",
    icon: "🧪",
    tools: [
      { name: "Temp Tower", file: "temp_tower.py", desc: "Generate temperature tower" },
      { name: "Resonant Frequency Test", file: "resonant_frequency_test.py", desc: "Test for resonant frequencies" },
      { name: "Analyze GCode", file: "analyze_gcode.py", desc: "Analyze printed GCode" },
    ]
  },
];

const guidesData = [
  {
    category: "Calibration Guides",
    icon: "📊",
    guides: [
      { name: "Bed Leveling Wizard", file: "bed_leveling_wizard.md", desc: "Complete bed leveling guide" },
      { name: "Linear Advance Calibration", file: "linear_advance_calibration_guide.md", desc: "Calibrate linear advance" },
      { name: "Pressure Advance Guide", file: "pressure_advance_guide.md", desc: "Pressure advance configuration" },
      { name: "Acceleration Tuning", file: "acceleration_tuning_guide.md", desc: "Tune acceleration settings" },
      { name: "Jerk Tuning", file: "jerk_tuning_guide.md", desc: "Configure jerk settings" },
      { name: "PID Tuning", file: "pid_tuning_guide.md", desc: "PID auto-tuning guide" },
      { name: "Vibration Compensation", file: "vibration_compensation_guide.md", desc: "Reduce vibrations" },
      { name: "Input Shaping Tutorial", file: "input_shaping_tutorial.md", desc: "Input shaping deep dive" },
    ]
  },
  {
    category: "Print Quality",
    icon: "✨",
    guides: [
      { name: "Print Quality Troubleshooting", file: "print_quality_troubleshooting.md", desc: "Solve common print issues" },
      { name: "Warping Prevention", file: "warping_prevention_guide.md", desc: "Prevent warping and cracking" },
      { name: "Stringing Solution", file: "stringing_solution_guide.md", desc: "Fix stringing and oozing" },
      { name: "Bridging & Overhang", file: "bridging_overhang_guide.md", desc: "Improve bridging performance" },
      { name: "Elephant Foot Compensation", file: "elephant_foot_compensation_guide.md", desc: "Fix elephant foot" },
      { name: "Layer Adhesion", file: "layer_adhesion_guide.md", desc: "Improve layer bonding" },
    ]
  },
  {
    category: "Materials",
    icon: "🧵",
    guides: [
      { name: "Filament Drying", file: "filament_drying_guide.md", desc: "How to dry filament properly" },
      { name: "Filament Moisture Detector", file: "filament_moisture_detector_guide.md", desc: "Detect moisture in filament" },
      { name: "Nozzle Temperature Guide", file: "nozzle_temperature_guide.md", desc: "Optimal temperatures by material" },
      { name: "Multi Material Guide", file: "multi_material_guide.md", desc: "Printing with multiple materials" },
      { name: "Enclosure Ventilation", file: "enclosure_ventilation_guide.md", desc: "Ventilate your enclosure" },
    ]
  },
  {
    category: "Hardware",
    icon: "🔧",
    guides: [
      { name: "Print Bed Surface Comparison", file: "print_bed_surface_comparison.md", desc: "Compare bed surfaces" },
    ]
  },
];

export default function ToolsPage() {
  const [search, setSearch] = useState("");

  const filteredTools = toolsData.map(cat => ({
    ...cat,
    tools: cat.tools.filter(t => 
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.tools.length > 0);

  const filteredGuides = guidesData.map(cat => ({
    ...cat,
    guides: cat.guides.filter(g => 
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.desc.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.guides.length > 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Calibration <span className="text-accent">Tools</span>
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
              OpenPrint3D includes a comprehensive suite of calibration tools and guides 
              to help you get the best prints possible.
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search tools and guides..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-xl border border-border bg-card text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
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

          {/* Python Tools */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span>🐍</span> Python Tools
              <span className="text-sm font-normal text-muted">(Run locally)</span>
            </h2>
            
            <div className="grid gap-8">
              {filteredTools.map((category) => (
                <div key={category.category} className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>{category.icon}</span> {category.category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.tools.map((tool) => (
                      <a
                        key={tool.file}
                        href={`https://raw.githubusercontent.com/ImagineNotChetng/OpenPrint3D-/main/tools/${tool.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium group-hover:text-accent transition-colors">
                              {tool.name}
                            </h4>
                            <p className="text-sm text-muted mt-1">{tool.desc}</p>
                          </div>
                          <span className="text-xs text-muted bg-muted px-2 py-1 rounded">
                            .py
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Guides */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span>📖</span> Guides & Documentation
              <span className="text-sm font-normal text-muted">(View online)</span>
            </h2>
            
            <div className="grid gap-8">
              {filteredGuides.map((category) => (
                <div key={category.category} className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>{category.icon}</span> {category.category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.guides.map((guide) => (
                      <a
                        key={guide.file}
                        href={`https://raw.githubusercontent.com/ImagineNotChetng/OpenPrint3D-/main/tools/${guide.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium group-hover:text-accent transition-colors">
                              {guide.name}
                            </h4>
                            <p className="text-sm text-muted mt-1">{guide.desc}</p>
                          </div>
                          <span className="text-xs text-muted bg-muted px-2 py-1 rounded">
                            .md
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Start */}
          <section className="mt-16 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-8 border border-accent/20">
            <h2 className="text-2xl font-bold mb-4">🚀 How to Use These Tools</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Python Scripts</h3>
                <ol className="list-decimal list-inside text-muted space-y-2">
                  <li>Install Python 3.8+</li>
                  <li>Clone this repository</li>
                  <li>Run: <code className="bg-muted px-2 py-1 rounded">python tools/&lt;tool&gt;.py</code></li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-2">View Guides</h3>
                <ol className="list-decimal list-inside text-muted space-y-2">
                  <li>Click any guide above</li>
                  <li>View raw Markdown in browser</li>
                  <li>Or clone and view in your editor</li>
                </ol>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
