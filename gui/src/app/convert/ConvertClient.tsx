"use client";

import { useState } from "react";

export default function ConvertClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"json2yaml" | "yaml2json">("json2yaml");
  const [error, setError] = useState("");

  const convert = () => {
    setError("");
    try {
      if (mode === "json2yaml") {
        const obj = JSON.parse(input);
        setOutput(objToYaml(obj));
      } else {
        setOutput(JSON.stringify(yamlToObj(input), null, 2));
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Conversion error");
    }
  };

  const objToYaml = (obj: unknown, indent = 0): string => {
    const prefix = "  ".repeat(indent);
    if (obj === null || obj === undefined) return "null";
    if (typeof obj === "string") return `"${obj}"`;
    if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
    if (Array.isArray(obj)) {
      return obj.map(item => `${prefix}- ${objToYaml(item, indent + 1)}`).join("\n");
    }
    if (typeof obj === "object") {
      return Object.entries(obj)
        .map(([k, v]) => `${prefix}${k}: ${objToYaml(v, indent + 1)}`)
        .join("\n");
    }
    return String(obj);
  };

  const yamlToObj = (yaml: string): unknown => {
    const lines = yaml.split("\n").filter(l => l.trim() && !l.trim().startsWith("#"));
    const result: Record<string, unknown> = {};
    let stack: { obj: Record<string, unknown>; indent: number }[] = [{ obj: result, indent: -1 }];

    for (const line of lines) {
      const match = line.match(/^(\s*)([^:]+):\s*(.*)$/);
      if (!match) continue;
      const [, indentStr, key, value] = match;
      const indent = indentStr.length;
      const trimmedKey = key.trim();

      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
      const current = stack[stack.length - 1].obj;

      if (value.trim()) {
        const trimmedValue = value.trim();
        let parsed: string | number | boolean | null = trimmedValue;
        if (trimmedValue === "null") parsed = null;
        else if (!isNaN(Number(trimmedValue))) parsed = Number(trimmedValue);
        else if (trimmedValue === "true") parsed = true;
        else if (trimmedValue === "false") parsed = false;
        current[trimmedKey] = parsed;
      } else {
        current[trimmedKey] = {};
        stack.push({ obj: current[trimmedKey] as Record<string, unknown>, indent });
      }
    }
    return result;
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button
          onClick={() => setMode("json2yaml")}
          className={`px-4 py-2 rounded-lg ${mode === "json2yaml" ? "bg-accent text-white" : "bg-card border border-border"}`}
        >
          JSON → YAML
        </button>
        <button
          onClick={() => setMode("yaml2json")}
          className={`px-4 py-2 rounded-lg ${mode === "yaml2json" ? "bg-accent text-white" : "bg-card border border-border"}`}
        >
          YAML → JSON
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={mode === "json2yaml" ? "Paste JSON here..." : "Paste YAML here..."}
          className="w-full h-96 p-4 rounded-lg bg-card border border-border font-mono text-sm"
        />
        <textarea
          value={output}
          readOnly
          placeholder="Output will appear here..."
          className="w-full h-96 p-4 rounded-lg bg-card border border-border font-mono text-sm"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button onClick={convert} className="btn-primary">
        Convert
      </button>
    </div>
  );
}
