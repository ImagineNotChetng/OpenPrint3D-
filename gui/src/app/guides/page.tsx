"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const guidesData = [
  {
    category: "Calibration Guides",
    icon: "📊",
    guides: [
      { slug: "bed_leveling_wizard", name: "Bed Leveling Wizard", desc: "Complete bed leveling guide for perfect first layers" },
      { slug: "linear_advance_calibration_guide", name: "Linear Advance Calibration", desc: "Calibrate linear advance for better prints" },
      { slug: "pressure_advance_guide", name: "Pressure Advance Guide", desc: "Pressure advance configuration and tuning" },
      { slug: "acceleration_tuning_guide", name: "Acceleration Tuning", desc: "Tune acceleration for optimal print quality" },
      { slug: "jerk_tuning_guide", name: "Jerk Tuning", desc: "Configure jerk settings for smooth motion" },
      { slug: "pid_tuning_guide", name: "PID Tuning", desc: "PID auto-tuning for stable temperatures" },
      { slug: "vibration_compensation_guide", name: "Vibration Compensation", desc: "Reduce vibrations for better quality" },
      { slug: "input_shaping_tutorial", name: "Input Shaping Tutorial", desc: "Deep dive into input shaping technology" },
    ]
  },
  {
    category: "Print Quality",
    icon: "✨",
    guides: [
      { slug: "print_quality_troubleshooting", name: "Print Quality Troubleshooting", desc: "Solve common print issues" },
      { slug: "warping_prevention_guide", name: "Warping Prevention", desc: "Prevent warping and cracking" },
      { slug: "stringing_solution_guide", name: "Stringing Solution", desc: "Fix stringing and oozing" },
      { slug: "bridging_overhang_guide", name: "Bridging & Overhang", desc: "Improve bridging performance" },
      { slug: "elephant_foot_compensation_guide", name: "Elephant Foot Compensation", desc: "Fix elephant foot artifacts" },
      { slug: "layer_adhesion_guide", name: "Layer Adhesion", desc: "Improve layer bonding" },
    ]
  },
  {
    category: "Materials",
    icon: "🧵",
    guides: [
      { slug: "filament_drying_guide", name: "Filament Drying", desc: "How to dry filament properly" },
      { slug: "filament_moisture_detector_guide", name: "Moisture Detection", desc: "Detect moisture in filament" },
      { slug: "nozzle_temperature_guide", name: "Nozzle Temperature", desc: "Optimal temperatures by material" },
      { slug: "multi_material_guide", name: "Multi Material", desc: "Printing with multiple materials" },
      { slug: "enclosure_ventilation_guide", name: "Enclosure Ventilation", desc: "Ventilate your enclosure properly" },
    ]
  },
  {
    category: "Hardware",
    icon: "🔧",
    guides: [
      { slug: "print_bed_surface_comparison", name: "Bed Surface Comparison", desc: "Compare print bed surfaces" },
    ]
  },
];

export default function GuidesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredGuides = guidesData.map(cat => ({
    ...cat,
    guides: cat.guides.filter(g => 
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.desc.toLowerCase().includes(search.toLowerCase()) ||
      g.slug.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.guides.length > 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
              <span>📖</span> OpenPrint3D Guides
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Calibration <span className="text-accent">Guides</span>
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
              Expert guides to help you calibrate your 3D printer and achieve perfect prints.
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search guides..."
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

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === null 
                  ? "bg-accent text-white" 
                  : "bg-card border border-border text-muted hover:border-accent/50"
              }`}
            >
              All Guides
            </button>
            {guidesData.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.category 
                    ? "bg-accent text-white" 
                    : "bg-card border border-border text-muted hover:border-accent/50"
                }`}
              >
                {cat.icon} {cat.category}
              </button>
            ))}
          </div>

          {/* Guides by Category */}
          <div className="grid gap-8">
            {(selectedCategory ? filteredGuides.filter(c => c.category === selectedCategory) : filteredGuides).map((category) => (
              <div key={category.category} className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span> {category.category}
                  <span className="text-sm font-normal text-muted">({category.guides.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.guides.map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/guides/${guide.slug}`}
                      className="p-5 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all group"
                    >
                      <h3 className="font-semibold mb-2 group-hover:text-accent transition-colors">
                        {guide.name}
                      </h3>
                      <p className="text-sm text-muted">{guide.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {guidesData.map((cat) => (
              <div key={cat.category} className="glass-card p-4 rounded-xl border border-border text-center">
                <div className="text-2xl mb-2">{cat.icon}</div>
                <div className="font-semibold">{cat.guides.length}</div>
                <div className="text-sm text-muted">{cat.category}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
