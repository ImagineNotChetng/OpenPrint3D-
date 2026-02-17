import { getProcesses } from "@/lib/profiles";
import { ProcessesClient } from "./client";

export default function ProcessesPage() {
  const processes = getProcesses();
  const intents = [...new Set(processes.map((p) => p.intent))].sort();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Process Profiles</h1>
        <p className="text-muted">
          {processes.length} process presets for different print intents
        </p>
      </div>
      <ProcessesClient processes={processes} intents={intents} />
    </div>
  );
}
