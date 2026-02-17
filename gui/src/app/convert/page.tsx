import ConvertClient from "./ConvertClient";

export default function ConvertPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Convert JSON ↔ YAML</h1>
        <p className="text-muted">
          Convert OpenPrint3D profiles between JSON and YAML formats. Paste your content below.
        </p>
      </div>
      <ConvertClient />
    </div>
  );
}
