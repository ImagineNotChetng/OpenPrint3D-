"use client";

interface ColorVariant {
  name: string;
  hex?: string;
  Pantone?: string;
}

interface ColorVariantsProps {
  variants: ColorVariant[];
}

export function ColorVariants({ variants }: ColorVariantsProps) {
  return (
    <div className="p-5 rounded-2xl bg-card border border-border">
      <h3 className="font-semibold text-sm mb-3">Color Variants ({variants.length})</h3>
      <div className="flex flex-wrap gap-3">
        {variants.map((variant, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card-hover border border-border"
          >
            <div
              className="w-6 h-6 rounded-md border border-border/50"
              style={{
                backgroundColor: variant.hex?.startsWith('#') ? variant.hex : `#${variant.hex || 'ccc'}`
              }}
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium">{variant.name}</span>
              {variant.Pantone && (
                <span className="text-[10px] text-muted">Pantone: {variant.Pantone}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
