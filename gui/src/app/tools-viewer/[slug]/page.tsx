"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const toolsData = [
  { slug: "temp_tower", name: "Temp Tower", desc: "Generate temperature tower", category: "Test Generators" },
  { slug: "retraction_calculator", name: "Retraction Calculator", desc: "Calculate optimal retraction", category: "Calculators" },
  { slug: "volumetric_flow_calculator", name: "Volumetric Flow Calculator", desc: "Calculate max volumetric flow", category: "Calculators" },
  { slug: "layer_height_optimizer", name: "Layer Height Optimizer", desc: "Optimize layer height", category: "Calculators" },
  { slug: "print_cost_calculator", name: "Print Cost Calculator", desc: "Calculate print costs", category: "Calculators" },
  { slug: "infill_optimizer", name: "Infill Optimizer", desc: "Optimize infill patterns", category: "Calculators" },
  { slug: "support_optimizer", name: "Support Optimizer", desc: "Optimize support settings", category: "Calculators" },
  { slug: "material_blend_calculator", name: "Material Blend Calculator", desc: "Blend materials", category: "Calculators" },
  { slug: "list_profiles", name: "List Profiles", desc: "List all profiles", category: "Profile Tools" },
  { slug: "batch_validate", name: "Batch Validate", desc: "Validate JSON profiles", category: "Profile Tools" },
  { slug: "convert_profile", name: "Convert Profile", desc: "Convert profile formats", category: "Profile Tools" },
  { slug: "compare_profiles", name: "Compare Profiles", desc: "Compare two profiles", category: "Profile Tools" },
  { slug: "input_shaping_wizard", name: "Input Shaping Wizard", desc: "Configure input shaping", category: "Calibration Wizards" },
  { slug: "first_layer_calibration", name: "First Layer Calibration", desc: "Calibrate first layer", category: "Calibration Wizards" },
  { slug: "extruder_calibration", name: "Extruder Calibration", desc: "Calibrate extruder", category: "Calibration Wizards" },
  { slug: "flow_rate_calibration", name: "Flow Rate Calibration", desc: "Calibrate flow rate", category: "Calibration Wizards" },
  { slug: "pressure_advance_tuner", name: "Pressure Advance Tuner", desc: "Tune pressure advance", category: "Calibration Wizards" },
  { slug: "resonant_frequency_test", name: "Resonant Frequency Test", desc: "Test resonant frequencies", category: "Test Generators" },
  { slug: "analyze_gcode", name: "Analyze GCode", desc: "Analyze GCode", category: "Test Generators" },
  { slug: "validate_schema", name: "Validate Schema", desc: "Validate JSON schema", category: "Other" },
  { slug: "format_convert", name: "Format Convert", desc: "Convert JSON to YAML", category: "Profile Tools" },
  { slug: "import_prusaslicer", name: "Import PrusaSlicer", desc: "Import from PrusaSlicer", category: "Profile Tools" },
  { slug: "slicer_translator", name: "Slicer Translator", desc: "Translate slicer formats", category: "Profile Tools" },
];

const GITHUB_RAW_URL = "https://raw.githubusercontent.com/ImagineNotChetng/OpenPrint3D-/main/tools";

export default function ToolViewerPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [pyodideLoaded, setPyodideLoaded] = useState(false);
  const pyodideRef = useRef<any>(null);
  
  const tool = toolsData.find(t => t.slug === slug);
  const currentIndex = toolsData.findIndex(t => t.slug === slug);
  const prevTool = currentIndex > 0 ? toolsData[currentIndex - 1] : null;
  const nextTool = currentIndex < toolsData.length - 1 ? toolsData[currentIndex + 1] : null;

  // Load Pyodide
  useEffect(() => {
    async function loadPyodide() {
      try {
        // @ts-ignore
        const pyodide = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
        });
        pyodideRef.current = pyodide;
        setPyodideLoaded(true);
      } catch (err) {
        console.error("Failed to load Pyodide:", err);
      }
    }
    loadPyodide();
  }, []);

  useEffect(() => {
    async function fetchTool() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${GITHUB_RAW_URL}/${slug}.py`);
        if (!response.ok) throw new Error("Tool not found");
        const text = await response.text();
        setCode(text);
      } catch (err) {
        setError("Failed to load tool");
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchTool();
  }, [slug]);

  const runCode = async () => {
    if (!pyodideRef.current || !code) return;
    setRunning(true);
    setOutput("");
    try {
      pyodideRef.current.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
      `);
      
      await pyodideRef.current.runPythonAsync(code);
      
      const stdout = pyodideRef.current.runPython("sys.stdout.getvalue()");
      setOutput(stdout || "✅ Code executed successfully (no output)");
    } catch (err: any) {
      setOutput(`❌ Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted">Loading tool...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-2">Tool Not Found</h1>
            <p className="text-muted mb-4">The tool "{slug}" could not be loaded.</p>
            <a href="/tools-viewer" className="text-purple-400 hover:underline">← Back to Tools</a>
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
        <div className="max-w-5xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <a href="/tools-viewer" className="text-purple-400 hover:underline text-sm">
              ← All Tools
            </a>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm border border-purple-500/30">
                  {tool.category}
                </span>
              </div>
              <h1 className="text-3xl font-bold">{tool.name}</h1>
              <p className="text-muted mt-1">{tool.desc}</p>
            </div>
            
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${pyodideLoaded ? "bg-green-500" : "bg-yellow-500"}`}></span>
              <span className="text-sm text-muted">
                {pyodideLoaded ? "Python Ready" : "Loading Python..."}
              </span>
            </div>
          </div>

          {/* Code Editor */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900/50 border-b border-border">
              <span className="text-sm text-muted">Python Code</span>
              <div className="flex gap-2">
                <button
                  onClick={copyCode}
                  className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
                <button
                  onClick={runCode}
                  disabled={!pyodideLoaded || running}
                  className="px-4 py-1.5 text-sm bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                >
                  {running ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Running...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Run Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code */}
            <div className="p-4 overflow-auto max-h-[500px]">
              <pre className="text-sm text-green-400 font-morphic">
                <code>{code}</code>
              </pre>
            </div>
          </div>

          {/* Output */}
          {output && (
            <div className="mt-6 bg-gray-900 rounded-2xl border border-border overflow-hidden">
              <div className="px-4 py-3 bg-gray-800/50 border-b border-border">
                <span className="text-sm text-muted">Output</span>
              </div>
              <div className="p-4">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-morphic">{output}</pre>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-8 border-t border-border">
            {prevTool ? (
              <a 
                href={`/tools-viewer/${prevTool.slug}`}
                className="flex items-center gap-2 text-muted hover:text-purple-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>{prevTool.name}</span>
              </a>
            ) : <div />}
            
            {nextTool && (
              <a 
                href={`/tools-viewer/${nextTool.slug}`}
                className="flex items-center gap-2 text-muted hover:text-purple-400 transition-colors"
              >
                <span>{nextTool.name}</span>
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
