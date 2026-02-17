"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const guidesData = [
  { slug: "bed_leveling_wizard", name: "Bed Leveling Wizard" },
  { slug: "linear_advance_calibration_guide", name: "Linear Advance Calibration" },
  { slug: "pressure_advance_guide", name: "Pressure Advance Guide" },
  { slug: "acceleration_tuning_guide", name: "Acceleration Tuning" },
  { slug: "jerk_tuning_guide", name: "Jerk Tuning" },
  { slug: "pid_tuning_guide", name: "PID Tuning" },
  { slug: "vibration_compensation_guide", name: "Vibration Compensation" },
  { slug: "input_shaping_tutorial", name: "Input Shaping Tutorial" },
  { slug: "print_quality_troubleshooting", name: "Print Quality Troubleshooting" },
  { slug: "warping_prevention_guide", name: "Warping Prevention" },
  { slug: "stringing_solution_guide", name: "Stringing Solution" },
  { slug: "bridging_overhang_guide", name: "Bridging & Overhang" },
  { slug: "elephant_foot_compensation_guide", name: "Elephant Foot Compensation" },
  { slug: "layer_adhesion_guide", name: "Layer Adhesion" },
  { slug: "filament_drying_guide", name: "Filament Drying" },
  { slug: "filament_moisture_detector_guide", name: "Moisture Detection" },
  { slug: "nozzle_temperature_guide", name: "Nozzle Temperature" },
  { slug: "multi_material_guide", name: "Multi Material" },
  { slug: "enclosure_ventilation_guide", name: "Enclosure Ventilation" },
  { slug: "print_bed_surface_comparison", name: "Bed Surface Comparison" },
];

const GITHUB_RAW_URL = "https://raw.githubusercontent.com/ImagineNotChetng/OpenPrint3D-/main/tools";

// Simple markdown to HTML converter
function parseMarkdown(md: string): string {
  let html = md
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-3 text-accent">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-accent">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-6 text-accent">$1</h1>')
    // Bold/Italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-900 p-4 rounded-xl overflow-x-auto my-4 border border-gray-700"><code class="text-sm text-green-400">$2</code></pre>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-2 py-1 rounded text-green-400 text-sm">$1</code>')
    // Lists
    .replace(/^\- (.*$)/gm, '<li class="ml-4 mb-2 text-gray-300">$1</li>')
    .replace(/^\* (.*$)/gm, '<li class="ml-4 mb-2 text-gray-300">$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 mb-2 text-gray-300 list-decimal">$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-4 text-gray-300 leading-relaxed">')
    // Tables (basic)
    .replace(/\|(.*)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells.some(c => c.includes('---'))) return '';
      return '<tr>' + cells.map(c => `<td class="border border-gray-700 px-4 py-2">${c.trim()}</td>`).join('') + '</tr>';
    });
  
  return `<div class="prose prose-invert max-w-none"><p class="mb-4 text-gray-300 leading-relaxed">${html}</p></div>`;
}

export default function GuideViewerPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  
  const guide = guidesData.find(g => g.slug === slug);
  const currentIndex = guidesData.findIndex(g => g.slug === slug);
  const prevGuide = currentIndex > 0 ? guidesData[currentIndex - 1] : null;
  const nextGuide = currentIndex < guidesData.length - 1 ? guidesData[currentIndex + 1] : null;

  useEffect(() => {
    async function fetchGuide() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${GITHUB_RAW_URL}/${slug}.md`);
        if (!response.ok) throw new Error("Guide not found");
        const text = await response.text();
        setContent(parseMarkdown(text));
      } catch (err) {
        setError("Failed to load guide");
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchGuide();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted">Loading guide...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-2">Guide Not Found</h1>
            <p className="text-muted mb-4">The guide "{slug}" could not be loaded.</p>
            <a href="/guides" className="text-accent hover:underline">← Back to Guides</a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <a href="/guides" className="text-accent hover:underline text-sm">
              ← All Guides
            </a>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{guide.name}</h1>
            <div className="flex gap-4 text-sm text-muted">
              <span>📖 Guide</span>
              <span>•</span>
              <span>{currentIndex + 1} of {guidesData.length}</span>
            </div>
          </div>

          {/* Content */}
          <div 
            className="bg-card rounded-2xl p-8 border border-border prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-8 border-t border-border">
            {prevGuide ? (
              <a 
                href={`/guides/${prevGuide.slug}`}
                className="flex items-center gap-2 text-muted hover:text-accent transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>{prevGuide.name}</span>
              </a>
            ) : <div />}
            
            {nextGuide && (
              <a 
                href={`/guides/${nextGuide.slug}`}
                className="flex items-center gap-2 text-muted hover:text-accent transition-colors"
              >
                <span>{nextGuide.name}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
