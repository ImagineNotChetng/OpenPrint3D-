"use client";

import { Badge } from "./badge";

const kinematicsInfo: Record<string, { label: string; description: string; variant: "default" | "accent" | "success" | "warning" | "danger" }> = {
  cartesian: { label: "Cartesian", description: "Standard XYZ movement", variant: "default" },
  corexy: { label: "CoreXY", description: "H-bot belt system", variant: "accent" },
  corexz: { label: "CoreXZ", description: "Vertical belt system", variant: "accent" },
  hybrid_corexy: { label: "Hybrid CoreXY", description: "CoreXY with Z-hop", variant: "success" },
  hybrid_corexz: { label: "Hybrid CoreXZ", description: "CoreXZ variant", variant: "success" },
  delta: { label: "Delta", description: "Rostock-style", variant: "warning" },
  scara: { label: "SCARA", description: "Selective compliance arm", variant: "danger" },
  polar: { label: "Polar", description: "Rotating bed", variant: "warning" },
  belt: { label: "Belt", description: "Belt-driven axis", variant: "accent" },
  other: { label: "Other", description: "Custom kinematics", variant: "default" },
};

interface KinematicsBadgeProps {
  kinematics: string;
}

export function KinematicsBadge({ kinematics }: KinematicsBadgeProps) {
  const info = kinematicsInfo[kinematics] || { label: kinematics, description: "Custom kinematics", variant: "default" as const };
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant={info.variant}>{info.label}</Badge>
      <span className="text-xs text-muted">{info.description}</span>
    </div>
  );
}

export { kinematicsInfo };
