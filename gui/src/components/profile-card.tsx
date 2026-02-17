"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "./badge";

type ProfileType = "filament" | "printer" | "process";

interface SharedProfileProps {
  id: string;
  type: ProfileType;
  href: string;
  title: string;
  subtitle?: string;
  badge?: { label: string; variant?: "default" | "accent" | "success" | "warning" | "danger" };
  secondaryBadge?: { label: string; variant?: "default" | "accent" | "success" | "warning" | "danger" };
  details?: { label: string; value: string }[];
  tags?: { label: string; variant?: "default" | "accent" | "success" | "warning" | "danger" }[];
  warningBadge?: { label: string; variant: "warning" | "danger" };
  extraBadges?: { label: string; variant: "warning" | "danger" }[];
}

interface ProfileCardProps extends SharedProfileProps {
  className?: string;
}

const favoritesStorage = {
  filament: "openprint3d-favorites-filaments",
  printer: "openprint3d-favorites-printers",
  process: "openprint3d-favorites-processes",
};

export function ProfileCard({
  id,
  type,
  href,
  title,
  subtitle,
  badge,
  secondaryBadge,
  details,
  tags,
  warningBadge,
  extraBadges,
  className = "",
}: ProfileCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storageKey = favoritesStorage[type];
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const favorites = JSON.parse(saved);
      setIsFavorite(favorites.includes(id));
    }
  }, [id, type]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const storageKey = favoritesStorage[type];
    const saved = localStorage.getItem(storageKey);
    let favorites: string[] = saved ? JSON.parse(saved) : [];

    if (isFavorite) {
      favorites = favorites.filter((f) => f !== id);
    } else {
      favorites = [...favorites, id];
    }

    localStorage.setItem(storageKey, JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  return (
    <Link href={href} className={`profile-card block card-shine ${className}`}>
      {mounted && (
        <button
          onClick={toggleFavorite}
          className={`favorite-btn ${isFavorite ? "active" : ""}`}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
            className="w-5 h-5"
            fill={isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      )}

      <div className="flex items-center justify-between mb-3 pr-6">
        <div className="flex items-center gap-2">
          {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
          {secondaryBadge && <Badge variant={secondaryBadge.variant}>{secondaryBadge.label}</Badge>}
        </div>
      </div>

      <h3 className="font-semibold text-sm group-hover:text-accent transition-colors mb-1 truncate pr-6">
        {title}
      </h3>

      {subtitle && <p className="text-xs text-muted mb-3">{subtitle}</p>}

      {details && details.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {details.slice(0, 3).map((detail, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-muted">{detail.label}</span>
              <span className="font-mono text-foreground">{detail.value}</span>
            </div>
          ))}
        </div>
      )}

      {(warningBadge || extraBadges) && (
        <div className="flex flex-wrap gap-1.5">
          {warningBadge && <Badge variant={warningBadge.variant}>{warningBadge.label}</Badge>}
          {extraBadges?.map((b, i) => (
            <Badge key={i} variant={b.variant}>
              {b.label}
            </Badge>
          ))}
        </div>
      )}

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {tags.slice(0, 3).map((tag, i) => (
            <Badge key={i} variant={tag.variant}>
              {tag.label}
            </Badge>
          ))}
        </div>
      )}
    </Link>
  );
}

export function FilamentCard({
  filament,
  className,
}: {
  filament: {
    id: string;
    name: string;
    brand: string;
    material: string;
    color?: string;
    color_variants?: Array<{ name: string; hex?: string }>;
    diameter?: number;
    nozzle: { min: number; max: number; recommended?: number };
    bed: { min: number; max: number; recommended?: number };
    environment?: { sensitive_to_moisture?: boolean; enclosure_recommended?: boolean };
    printing_speed?: { min?: number; max?: number; recommended?: number };
  };
  className?: string;
}) {
  return (
    <ProfileCard
      id={filament.id}
      type="filament"
      href={`/filaments/${encodeURIComponent(filament.id)}`}
      title={filament.name}
      subtitle={filament.brand}
      badge={{ label: filament.material, variant: "accent" }}
      secondaryBadge={filament.diameter ? { label: `${filament.diameter}mm` } : undefined}
      details={[
        { label: "Nozzle", value: `${filament.nozzle.min}–${filament.nozzle.max}°C` },
        { label: "Bed", value: `${filament.bed.min}–${filament.bed.max}°C` },
        ...(filament.printing_speed?.recommended ? [{ label: "Speed", value: `${filament.printing_speed.recommended} mm/s` }] : []),
      ]}
      warningBadge={
        filament.environment?.sensitive_to_moisture ? { label: "Moisture Sensitive", variant: "warning" } : undefined
      }
      extraBadges={
        filament.environment?.enclosure_recommended ? [{ label: "Enclosure", variant: "danger" }] : undefined
      }
      className={className}
    />
  );
}

export function PrinterCard({
  printer,
  className,
}: {
  printer: {
    id: string;
    model: string;
    manufacturer: string;
    kinematics: string;
    build_volume: { x: number; y: number; z: number };
    firmware: { flavor: string };
    extruders?: Array<{ nozzle_diameter: number }>;
    tags?: string[];
    personal_preferences?: Record<string, unknown>;
  };
  className?: string;
}) {
  const nozzleSize = printer.extruders && printer.extruders.length > 0 ? printer.extruders[0]?.nozzle_diameter : null;
  return (
    <ProfileCard
      id={printer.id}
      type="printer"
      href={`/printers/${encodeURIComponent(printer.id)}`}
      title={printer.model}
      subtitle={printer.manufacturer}
      badge={{ label: printer.kinematics, variant: "accent" }}
      secondaryBadge={{ label: `${printer.build_volume.x}×${printer.build_volume.y}×${printer.build_volume.z}` }}
      details={[
        { label: "Firmware", value: printer.firmware.flavor },
        ...(nozzleSize ? [{ label: "Nozzle", value: `${nozzleSize}mm` }] : []),
      ]}
      tags={printer.tags?.map((t) => ({ label: t }))}
      extraBadges={printer.personal_preferences ? [{ label: "Personal Prefs", variant: "warning" as const }] : undefined}
      className={className}
    />
  );
}

export function ProcessCard({
  process,
  className,
}: {
  process: {
    id: string;
    name: string;
    intent: string;
    layer_height?: { default?: number };
    speed?: { outer_wall?: number; infill?: number };
    infill?: { density_default?: number };
    quality_bias?: { priority?: string };
  };
  className?: string;
}) {
  const intentColors: Record<string, "accent" | "success" | "warning" | "danger" | "default"> = {
    high_detail: "accent",
    quality: "success",
    standard: "default",
    draft: "warning",
    mechanical: "danger",
    flexible: "accent",
    functional: "success",
  };

  return (
    <ProfileCard
      id={process.id}
      type="process"
      href={`/processes/${encodeURIComponent(process.id)}`}
      title={process.name}
      subtitle={process.layer_height?.default ? `Layer: ${process.layer_height.default}mm` : undefined}
      badge={{ label: process.intent.replace("_", " "), variant: intentColors[process.intent] ?? "default" }}
      details={[
        ...(process.speed
          ? [
              { label: "Outer Wall", value: `${process.speed.outer_wall} mm/s` },
              { label: "Infill", value: `${process.speed.infill} mm/s` },
            ]
          : []),
        ...(process.infill ? [{ label: "Infill Density", value: `${process.infill.density_default}%` }] : []),
      ]}
      className={className}
    />
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="profile-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-12 rounded-full" />
      </div>
      <div className="skeleton h-4 w-3/4 rounded mb-2" />
      <div className="skeleton h-3 w-1/2 rounded mb-4" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
      </div>
    </div>
  );
}