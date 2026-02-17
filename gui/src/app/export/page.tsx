import { getFilaments, getPrinters, getProcesses } from "@/lib/profiles";
import { ExportClient } from "./client";

export default function ExportPage() {
  const filaments = getFilaments();
  const printers = getPrinters();
  const processes = getProcesses();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Export to Slicer</h1>
        <p className="text-muted">
          Convert OpenPrint3D profiles to native slicer formats. Select your profiles, pick your slicer, and download.
        </p>
      </div>
      <ExportClient
        filaments={JSON.parse(JSON.stringify(filaments))}
        printers={JSON.parse(JSON.stringify(printers))}
        processes={JSON.parse(JSON.stringify(processes))}
      />
    </div>
  );
}
