"use client";
import { useState } from "react";

export function JsonViewer({ data }: { data: object }) {
  const [isOpen, setIsOpen] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-muted hover:text-foreground bg-card hover:bg-card-hover transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Raw JSON
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="relative">
          <pre className="p-4 text-xs font-mono text-muted overflow-x-auto bg-background max-h-96">
            {jsonString}
          </pre>
          <button
            onClick={() => navigator.clipboard.writeText(jsonString)}
            className="absolute top-2 right-2 px-2 py-1 text-xs bg-card border border-border rounded-lg hover:bg-card-hover transition-colors text-muted hover:text-foreground"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
