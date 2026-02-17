import { getPrinters } from "@/lib/profiles";
import { PrintersClient } from "./client";

export default function PrintersPage() {
  const printers = getPrinters();
  const manufacturers = [...new Set(printers.map((p) => p.manufacturer))].sort();
  const kinematics = [...new Set(printers.map((p) => p.kinematics))].sort();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Printer Profiles</h1>
        <p className="text-muted">
          {printers.length} printer profiles from {manufacturers.length} manufacturers
        </p>
      </div>
      <PrintersClient printers={printers} manufacturers={manufacturers} kinematics={kinematics} />
    </div>
  );
}
