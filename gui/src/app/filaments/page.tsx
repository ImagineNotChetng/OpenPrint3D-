import { getFilaments } from "@/lib/profiles";
import { FilamentsClient } from "./client";

export default function FilamentsPage() {
  const filaments = getFilaments();
  const materials = [...new Set(filaments.map((f) => f.material))].sort();
  const brands = [...new Set(filaments.map((f) => f.brand))].sort();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Filament Profiles</h1>
        <p className="text-muted">
          {filaments.length} filament profiles across {brands.length} brands and {materials.length} materials
        </p>
      </div>
      <FilamentsClient filaments={filaments} materials={materials} brands={brands} />
    </div>
  );
}
