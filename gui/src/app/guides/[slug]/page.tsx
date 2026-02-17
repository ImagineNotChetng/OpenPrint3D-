"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
        setContent(text);
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
            <Link href="/guides" className="text-accent hover:underline">← Back to Guides</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Hero Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
      
      <main className="flex-1 py-12 relative">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/guides" className="inline-flex items-center gap-2 text-accent hover:underline text-sm bg-accent/10 px-4 py-2 rounded-full border border-accent/20 transition-all hover:bg-accent/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All Guides
            </Link>
          </div>

          {/* Header Card */}
          <div className="bg-gradient-to-br from-accent/20 to-purple-500/20 rounded-3xl p-8 mb-8 border border-accent/30">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-accent/30 text-accent text-sm font-medium border border-accent/40">
                📖 Guide
              </span>
              <span className="text-sm text-muted">{currentIndex + 1} of {guidesData.length}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">{guide.name}</h1>
          </div>

          {/* Content Card */}
          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-2xl">
            <div className="p-8 md:p-12">
              <article className="
                prose prose-invert max-w-none
                prose-headings:font-bold prose-headings:text-foreground
                prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-0
                prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border
                prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-8
                prose-p:text-gray-300 prose-p:leading-8 prose-p:text-lg prose-p:mb-6
                prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white prose-strong:font-semibold
                prose-code:text-green-400 prose-code:bg-green-400/10 prose-code:px-3 prose-code:py-1.5 prose-code:rounded-lg prose-code:text-base prose-code:font-mono
                prose-pre:bg-gradient-to-br prose-pre:from-gray-900 prose-pre:to-gray-800 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-2xl prose-pre:p-6
                prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-accent/5 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                prose-ul:text-gray-300 prose-ul:pl-6 prose-ul:space-y-2
                prose-ol:text-gray-300 prose-ol:pl-6 prose-ol:space-y-2
                prose-li:pl-2
                prose-table:w-full prose-table:border-collapse prose-table:rounded-xl prose-table:overflow-hidden
                prose-th:bg-gradient-to-r prose-th:from-gray-800 prose-th:to-gray-700 prose-th:text-white prose-th:font-semibold prose-th:px-6 prose-th:py-4 prose-th:text-left
                prose-td:px-6 prose-td:py-3 prose-td:border-t prose-td:border-gray-700
                prose-tr:hover:bg-gray-800/50
                prose-img:rounded-2xl prose-img:shadow-2xl prose-img:border prose-img:border-gray-700
                prose-hr:border-gray-700 prose-hr:my-10
                prose-span:text-yellow-400
                prose-divider:border-gray-700
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </article>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-10 pt-8 border-t border-border">
            {prevGuide ? (
              <Link 
                href={`/guides/${prevGuide.slug}`}
                className="group flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-accent hover:bg-accent/5 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-muted">Previous</div>
                  <div className="font-medium">{prevGuide.name}</div>
                </div>
              </Link>
            ) : <div />}
            
            {nextGuide && (
              <Link 
                href={`/guides/${nextGuide.slug}`}
                className="group flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-accent hover:bg-accent/5 transition-all"
              >
                <div className="text-right">
                  <div className="text-xs text-muted">Next</div>
                  <div className="font-medium">{nextGuide.name}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
